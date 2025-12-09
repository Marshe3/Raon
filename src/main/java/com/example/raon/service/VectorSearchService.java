package com.example.raon.service;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * 벡터 검색 서비스
 * 코사인 유사도 기반 시맨틱 검색
 */
@Slf4j
@Service
public class VectorSearchService {

    /**
     * 코사인 유사도 계산
     *
     * @param vectorA 벡터 A
     * @param vectorB 벡터 B
     * @return 코사인 유사도 (0.0 ~ 1.0)
     */
    public double cosineSimilarity(double[] vectorA, double[] vectorB) {
        if (vectorA.length != vectorB.length) {
            throw new IllegalArgumentException("벡터 차원이 일치하지 않습니다");
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += vectorA[i] * vectorA[i];
            normB += vectorB[i] * vectorB[i];
        }

        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }

        double similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));

        // 코사인 유사도는 -1 ~ 1 범위인데, 0 ~ 1로 정규화
        return (similarity + 1.0) / 2.0;
    }

    /**
     * Top-K 유사 벡터 검색
     *
     * @param queryVector 질의 벡터
     * @param candidateVectors 후보 벡터 리스트
     * @param k 반환할 상위 개수
     * @return 유사도 점수와 인덱스 리스트
     */
    public <T> List<SearchResult<T>> searchTopK(
            double[] queryVector,
            List<VectorItem<T>> candidateVectors,
            int k) {

        log.debug("🔍 벡터 검색 시작 - 후보: {}개, Top-K: {}", candidateVectors.size(), k);

        List<SearchResult<T>> results = new ArrayList<>();

        for (int i = 0; i < candidateVectors.size(); i++) {
            VectorItem<T> item = candidateVectors.get(i);
            double similarity = cosineSimilarity(queryVector, item.getVector());
            results.add(new SearchResult<>(item.getData(), similarity, i));
        }

        // 유사도 기준 내림차순 정렬 후 상위 K개 선택
        results.sort(Comparator.comparingDouble(SearchResult<T>::getSimilarity).reversed());

        List<SearchResult<T>> topK = results.stream()
                .limit(k)
                .toList();

        log.debug("✅ 벡터 검색 완료 - Top-{} 선택됨", topK.size());

        if (!topK.isEmpty()) {
            log.debug("   최고 유사도: {}, 최저 유사도: {}",
                topK.get(0).getSimilarity(),
                topK.get(topK.size() - 1).getSimilarity());
        }

        return topK;
    }

    /**
     * 벡터 아이템 (데이터 + 벡터)
     */
    @Data
    public static class VectorItem<T> {
        private final T data;
        private final double[] vector;

        public VectorItem(T data, double[] vector) {
            this.data = data;
            this.vector = vector;
        }
    }

    /**
     * 검색 결과 (데이터 + 유사도 + 인덱스)
     */
    @Data
    public static class SearchResult<T> {
        private final T data;
        private final double similarity;
        private final int index;

        public SearchResult(T data, double similarity, int index) {
            this.data = data;
            this.similarity = similarity;
            this.index = index;
        }
    }
}
