import { fetchWeather } from "./weatherService";
import { fetchTide } from "./tideService";

const jsonResponse = (payload) => ({
  ok: true,
  status: 200,
  json: jest.fn().mockResolvedValue(payload),
});

describe("environmental service temporal correctness", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test("weather forecast starts at the current hour rather than midnight", async () => {
    const times = Array.from({ length: 24 }, (_, hour) =>
      `2026-08-12T${String(hour).padStart(2, "0")}:00`
    );
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        current: {
          time: "2026-08-12T10:15",
          temperature_2m: 27,
          precipitation: 0.2,
          rain: 0.2,
          weather_code: 61,
          relative_humidity_2m: 85,
          wind_speed_10m: 12,
        },
        hourly: {
          time: times,
          precipitation: Array.from({ length: 24 }, (_, hour) => hour),
          precipitation_probability: Array.from({ length: 24 }, (_, hour) => hour),
        },
      })
    );

    const result = await fetchWeather();

    expect(result.forecast.hourly.time).toEqual(times.slice(10, 16));
    expect(result.forecast.hourly.precipitation).toEqual([10, 11, 12, 13, 14, 15]);
    expect(result.forecast.peakNext6hMm).toBe(15);
  });

  test("tide timestamps are parsed as IST, future-only, and trend uses the next adjacent hour", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-08-11T18:45:00.000Z")); // 2026-08-12 00:15 IST

    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        current: {
          time: "2026-08-12T00:15",
          sea_level_height_msl: 0.73,
        },
        hourly: {
          time: [
            "2026-08-11T23:00",
            "2026-08-12T00:00",
            "2026-08-12T01:00",
            "2026-08-12T02:00",
            "2026-08-12T03:00",
            "2026-08-12T04:00",
            "2026-08-12T05:00",
            "2026-08-12T06:00",
          ],
          sea_level_height_msl: [0.9, 0.73, -0.09, -0.4, -0.1, 0.5, 0.2, -0.2],
        },
      })
    );

    const result = await fetchTide();

    expect(result.current.trend).toBe("falling");
    expect(result.next.low).not.toBeNull();
    expect(result.next.high).not.toBeNull();
    expect(Date.parse(result.next.low.at)).toBeGreaterThan(Date.now());
    expect(Date.parse(result.next.high.at)).toBeGreaterThan(Date.now());
    expect(result.next.low.in).toMatch(/^in (?!0(?:h| min))/);
    expect(result.next.high.in).toMatch(/^in (?!0(?:h| min))/);
    expect(result.next.low.in).not.toContain("-");
    expect(result.next.high.in).not.toContain("-");
  });
});
