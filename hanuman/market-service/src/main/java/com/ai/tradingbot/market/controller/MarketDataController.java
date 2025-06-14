package com.ai.tradingbot.market.controller;

import com.ai.tradingbot.market.service.AngelBrokingStockService;
import com.ai.tradingbot.market.service.BinanceCryptoService;
import com.ai.tradingbot.market.service.ForexService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import java.util.Map;

@RestController
@RequestMapping("/api/market")
@Tag(name = "Market Data", description = "Endpoints for stock, crypto, and forex data")
public class MarketDataController {
    @Autowired
    private AngelBrokingStockService angelBrokingStockService;
    @Autowired
    private BinanceCryptoService binanceCryptoService;
    @Autowired
    private ForexService forexService;

    @Operation(summary = "Get stock data", description = "Fetch real-time stock price, volume, and timestamp using Angel Broking API.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Stock data retrieved successfully",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"symbol\":\"RELIANCE\",\"price\":2800.5,\"volume\":10000,\"timestamp\":\"2025-06-14T10:00:00Z\"}"))),
        @ApiResponse(responseCode = "404", description = "Stock symbol not found", content = @Content)
    })
    @GetMapping("/stock/{symbol}")
    public ResponseEntity<Map<String, Object>> getStock(
            @Parameter(description = "Stock symbol, e.g. RELIANCE", example = "RELIANCE") @PathVariable String symbol) {
        Map<String, Object> data = angelBrokingStockService.getStockData(symbol);
        return ResponseEntity.ok(data);
    }

    @Operation(summary = "Get crypto data", description = "Fetch real-time crypto price, volume, and timestamp using Binance API.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Crypto data retrieved successfully",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"symbol\":\"BTCUSDT\",\"price\":67000.0,\"volume\":1200,\"timestamp\":\"2025-06-14T10:00:00Z\"}"))),
        @ApiResponse(responseCode = "404", description = "Crypto symbol not found", content = @Content)
    })
    @GetMapping("/crypto/{symbol}")
    public Mono<ResponseEntity<Map<String, Object>>> getCrypto(
            @Parameter(description = "Crypto symbol, e.g. BTCUSDT", example = "BTCUSDT") @PathVariable String symbol) {
        return binanceCryptoService.getCryptoData(symbol)
                .map(ResponseEntity::ok);
    }

    @Operation(summary = "Get forex data", description = "Fetch real-time forex rate and timestamp using exchangerate.host API.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Forex data retrieved successfully",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"from\":\"USD\",\"to\":\"INR\",\"rate\":83.2,\"timestamp\":\"2025-06-14T10:00:00Z\"}"))),
        @ApiResponse(responseCode = "404", description = "Currency pair not found", content = @Content)
    })
    @GetMapping("/forex/{from}/{to}")
    public ResponseEntity<Map<String, Object>> getForex(
            @Parameter(description = "Base currency, e.g. USD", example = "USD") @PathVariable String from,
            @Parameter(description = "Target currency, e.g. INR", example = "INR") @PathVariable String to) {
        Map<String, Object> data = forexService.getForexRates(from, to);
        return ResponseEntity.ok(data);
    }
}
