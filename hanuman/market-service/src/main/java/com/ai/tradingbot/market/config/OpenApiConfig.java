package com.ai.tradingbot.market.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "Market Data API",
        version = "1.0",
        description = "API for real-time stock, crypto, and forex data"
    )
)
public class OpenApiConfig {
}
