package com.ai.tradingbot.market.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.JsonNode;
import reactor.core.publisher.Mono;
import java.util.HashMap;
import java.util.Map;

@Service
public class BinanceCryptoService {
    private final WebClient webClient = WebClient.create("https://api.binance.com");

    public Mono<Map<String, Object>> getCryptoData(String symbol) {
        return webClient.get()
                .uri("/api/v3/ticker/24hr?symbol=" + symbol)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .map(body -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("price", body.path("lastPrice").asText());
                    result.put("volume", body.path("volume").asText());
                    result.put("timestamp", body.path("closeTime").asText());
                    return result;
                });
    }
}
