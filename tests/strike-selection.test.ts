import { describe, expect, it } from "vitest";
import { defaultStrategyConfig } from "@/lib/strategy-config";
import { selectStrangles } from "@/services/strike-selection.service";

describe("selectStrangles", () => {
  it("selects nearest premium short legs and hedge band legs", () => {
    const contracts = [
      { exchange: "NFO", tradingsymbol: "NIFTY_CE_1", instrumentToken: "1", indexType: "NIFTY", optionType: "CE", strike: 24000, expiry: "2026-02-20" },
      { exchange: "NFO", tradingsymbol: "NIFTY_CE_2", instrumentToken: "2", indexType: "NIFTY", optionType: "CE", strike: 24100, expiry: "2026-02-20" },
      { exchange: "NFO", tradingsymbol: "NIFTY_PE_1", instrumentToken: "3", indexType: "NIFTY", optionType: "PE", strike: 23800, expiry: "2026-02-20" },
      { exchange: "NFO", tradingsymbol: "NIFTY_PE_2", instrumentToken: "4", indexType: "NIFTY", optionType: "PE", strike: 23700, expiry: "2026-02-20" },
    ] as const;

    const quote = {
      "NFO:NIFTY_CE_1": { last_price: 75 },
      "NFO:NIFTY_CE_2": { last_price: 130 },
      "NFO:NIFTY_PE_1": { last_price: 76 },
      "NFO:NIFTY_PE_2": { last_price: 125 },
    };

    const picked = selectStrangles("NIFTY", [...contracts], quote, defaultStrategyConfig);
    expect(picked.shortCe.tradingsymbol).toBe("NIFTY_CE_1");
    expect(picked.shortPe.tradingsymbol).toBe("NIFTY_PE_1");
    expect(picked.longCe.tradingsymbol).toBe("NIFTY_CE_2");
    expect(picked.longPe.tradingsymbol).toBe("NIFTY_PE_2");
  });
});
