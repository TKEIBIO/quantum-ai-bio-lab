#!/usr/bin/env python3
"""유전자 네트워크 커뮤니티 탐지: 모듈성 QUBO + QAOA

네트워크를 두 커뮤니티로 나누는 문제를 모듈성 최대화로 정식화합니다.
  Q = (1 / 4m) * s^T B s,   B_ij = A_ij - k_i k_j / 2m,   s_i ∈ {+1, -1}
이를 Ising 해밀토니안 H = -Σ_ij B_ij Z_i Z_j 의 바닥상태 문제로 바꿔 QAOA로 풉니다.
결과는 완전탐색(정답)·Simulated Annealing과 비교합니다.

사용 예:
  python qaoa_modularity.py --nodes 8 --p 2
  python qaoa_modularity.py --edges my_network.tsv --p 3      # 'geneA<TAB>geneB<TAB>weight'
"""
import argparse
import itertools
import math
import random

import numpy as np


# ---------- 네트워크 ----------
def toy_network(n, seed=7):
    """두 개의 조밀한 모듈이 약하게 연결된 예제 네트워크."""
    rng = random.Random(seed)
    half = n // 2
    names = [f"G{i+1}" for i in range(n)]
    edges = []
    for i, j in itertools.combinations(range(n), 2):
        same = (i < half) == (j < half)
        if rng.random() < (0.8 if same else 0.1):
            edges.append((i, j, 1.0))
    return names, edges


def read_edges(path):
    idx, edges = {}, []
    for line in open(path):
        parts = line.strip().split("\t")
        if len(parts) < 2 or line.startswith("#"):
            continue
        a, b = parts[0], parts[1]
        w = float(parts[2]) if len(parts) > 2 else 1.0
        for g in (a, b):
            idx.setdefault(g, len(idx))
        edges.append((idx[a], idx[b], w))
    return list(idx), edges


def modularity_matrix(n, edges):
    A = np.zeros((n, n))
    for i, j, w in edges:
        A[i, j] = A[j, i] = w
    k = A.sum(1)
    m2 = k.sum()
    return A - np.outer(k, k) / m2, m2 / 2


def modularity(s, B, m):
    s = np.asarray(s)
    return float(s @ B @ s) / (4 * m)


# ---------- 고전 기준선 ----------
def brute_force(B, m):
    n = len(B)
    best = max(itertools.product([1, -1], repeat=n - 1), key=lambda t: modularity((1,) + t, B, m))
    s = (1,) + best
    return s, modularity(s, B, m)


def simulated_annealing(B, m, steps=5000, seed=0):
    rng = np.random.default_rng(seed)
    s = rng.choice([1, -1], len(B))
    cur = modularity(s, B, m)
    best, best_s = cur, s.copy()
    for t in range(steps):
        T = 1.0 * (1 - t / steps) + 1e-3
        i = rng.integers(len(B))
        s[i] *= -1
        new = modularity(s, B, m)
        if new >= cur or rng.random() < math.exp((new - cur) * 50 / T):
            cur = new
            if cur > best:
                best, best_s = cur, s.copy()
        else:
            s[i] *= -1
    return tuple(best_s), best


# ---------- QAOA ----------
def run_qaoa(B, m, p, shots, seed):
    from qiskit import QuantumCircuit
    from qiskit.primitives import StatevectorSampler
    from scipy.optimize import minimize

    n = len(B)
    pairs = [(i, j, B[i, j]) for i in range(n) for j in range(i + 1, n) if abs(B[i, j]) > 1e-12]
    scale = max(abs(w) for *_, w in pairs)

    def circuit(params):
        g, b = params[:p], params[p:]
        qc = QuantumCircuit(n)
        qc.h(range(n))
        for layer in range(p):
            for i, j, w in pairs:      # exp(+i γ B_ij Z_i Z_j): 모듈성 최대화 방향
                qc.rzz(-2 * g[layer] * w / scale, i, j)
            qc.rx(2 * b[layer], range(n))
        qc.measure_all()
        return qc

    sampler = StatevectorSampler(seed=seed)

    def counts(params):
        res = sampler.run([circuit(params)], shots=shots).result()[0]
        return res.data.meas.get_counts()

    def to_spins(bits):  # qiskit 비트열은 오른쪽이 qubit 0
        return [1 if c == "0" else -1 for c in reversed(bits)]

    def cost(params):
        c = counts(params)
        return -sum(v * modularity(to_spins(k), B, m) for k, v in c.items()) / shots

    rng = np.random.default_rng(seed)
    best = None
    for _ in range(3):  # 랜덤 초기값 몇 번 시도
        x0 = rng.uniform(0, math.pi, 2 * p)
        r = minimize(cost, x0, method="COBYLA", options={"maxiter": 150})
        if best is None or r.fun < best.fun:
            best = r
    final = counts(best.x)
    top = max(final, key=lambda k: modularity(to_spins(k), B, m))
    s = to_spins(top)
    return tuple(s), modularity(s, B, m), -best.fun


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--nodes", type=int, default=8)
    ap.add_argument("--edges", help="TSV 엣지 파일 (geneA, geneB, weight)")
    ap.add_argument("--p", type=int, default=2, help="QAOA 회로 깊이")
    ap.add_argument("--shots", type=int, default=2048)
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()

    names, edges = read_edges(args.edges) if args.edges else toy_network(args.nodes)
    B, m = modularity_matrix(len(names), edges)
    print(f"네트워크: 노드 {len(names)}개, 엣지 {len(edges)}개 → 큐비트 {len(names)}개\n")

    def show(label, s, q):
        a = [names[i] for i, v in enumerate(s) if v == 1]
        b = [names[i] for i, v in enumerate(s) if v == -1]
        print(f"[{label}] Q = {q:.4f}\n   모듈 A: {', '.join(a)}\n   모듈 B: {', '.join(b)}")

    exact_s, exact_q = brute_force(B, m) if len(names) <= 22 else (None, None)
    if exact_s:
        show("완전탐색 (정답)", exact_s, exact_q)
    sa_s, sa_q = simulated_annealing(B, m, seed=args.seed)
    show("Simulated Annealing", sa_s, sa_q)

    try:
        q_s, q_q, q_mean = run_qaoa(B, m, args.p, args.shots, args.seed)
        show(f"QAOA p={args.p}", q_s, q_q)
        print(f"   기대 모듈성 = {q_mean:.4f}")
        if exact_q:
            print(f"   근사비 (최고 샘플 / 정답) = {q_q / exact_q:.3f}")
    except ImportError:
        print("\nQAOA를 실행하려면: pip install -r requirements.txt")


if __name__ == "__main__":
    main()
