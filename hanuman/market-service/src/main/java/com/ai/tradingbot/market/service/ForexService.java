package com.ai.tradingbot.market.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.HashMap;
import java.util.Map;

@Service
public class ForexService {
    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> getForexRates(String base, String symbols) {
        String url = "https://api.exchangerate.host/latest?base=" + base + "&symbols=" + symbols;
        JsonNode body = restTemplate.getForObject(url, JsonNode.class);
        Map<String, Object> result = new HashMap<>();
        if (body != null) {
            result.put("rates", body.path("rates"));
            result.put("timestamp", body.path("date").asText());
        }
        return result;
    }
}
