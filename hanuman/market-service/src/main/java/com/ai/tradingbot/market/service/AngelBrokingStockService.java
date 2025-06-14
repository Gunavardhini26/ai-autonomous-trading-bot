package com.ai.tradingbot.market.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.HashMap;
import java.util.Map;

@Service
public class AngelBrokingStockService {
    @Value("${angel.api.url}")
    private String apiUrl;
    @Value("${angel.api.key}")
    private String apiKey;
    @Value("${angel.api.token}")
    private String apiToken;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> getStockData(String symbol) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiToken);
        headers.set("X-API-KEY", apiKey);
        HttpEntity<String> entity = new HttpEntity<>(headers);
        String url = apiUrl + "/stock/real-time/" + symbol;
        ResponseEntity<JsonNode> response = restTemplate.exchange(url, HttpMethod.GET, entity, JsonNode.class);
        JsonNode body = response.getBody();
        Map<String, Object> result = new HashMap<>();
        if (body != null) {
            result.put("price", body.path("price").asDouble());
            result.put("volume", body.path("volume").asLong());
            result.put("timestamp", body.path("timestamp").asText());
        }
        return result;
    }
}
