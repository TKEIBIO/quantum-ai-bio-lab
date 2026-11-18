# QAOA 유전자 네트워크 커뮤니티 탐지

유전자 상호작용 네트워크를 두 모듈로 나누는 문제를 **모듈성(modularity) QUBO**로 정식화하고,
**QAOA**로 풀어 완전탐색·Simulated Annealing 결과와 비교합니다.
실험실의 ASFV·PEDV 공통 대식세포 억제 네트워크 연구에서 사용한 접근법을 단순화한 튜토리얼입니다.

## 실행

```bash
pip install -r requirements.txt
python qaoa_modularity.py --nodes 8 --p 2
```

내 네트워크로 실행하려면 탭으로 구분된 엣지 파일(`geneA  geneB  weight`)을 넣습니다.

```bash
python qaoa_modularity.py --edges my_network.tsv --p 3
```

## 수식

- 모듈성 행렬: `B_ij = A_ij − k_i k_j / 2m`
- 두 모듈 분할 `s_i ∈ {+1, −1}`에 대해 `Q = sᵀ B s / 4m`
- Ising 해밀토니안 `H = −Σ B_ij Z_i Z_j`의 바닥상태 = 최대 모듈성 분할

## 실제 양자 하드웨어

`StatevectorSampler` 대신 `qiskit-ibm-runtime`의 `SamplerV2`와 트랜스파일러를 쓰면
IBM Quantum 장비에서 실행할 수 있습니다. 실기에서는 회로 깊이 p가 커질수록 노이즈 영향이 커지므로
조밀한 네트워크는 낮은 p부터 비교해 보세요.
