export const dynamic = 'force-dynamic';

type Clima = {
  fuente: 'OpenWeather' | 'Open-Meteo';
  fecha: string;
  esEstimado: boolean;
  temp: number | null;
  tempMax: number | null;
  tempMin: number | null;
  descripcion: string;
  emoji: string;
  lluviaProb: number | null;
  viento: number | null;
};

// WMO weather code (Open-Meteo) -> descripción + emoji
function desdeWMO(code: number): { descripcion: string; emoji: string } {
  if (code === 0) return { descripcion: 'Despejado', emoji: '☀️' };
  if (code <= 2) return { descripcion: 'Parcialmente nublado', emoji: '🌤️' };
  if (code === 3) return { descripcion: 'Nublado', emoji: '☁️' };
  if (code <= 48) return { descripcion: 'Niebla', emoji: '🌫️' };
  if (code <= 67) return { descripcion: 'Lluvia', emoji: '🌧️' };
  if (code <= 77) return { descripcion: 'Nieve', emoji: '❄️' };
  if (code <= 82) return { descripcion: 'Chubascos', emoji: '🌦️' };
  if (code <= 86) return { descripcion: 'Nieve', emoji: '🌨️' };
  return { descripcion: 'Tormenta', emoji: '⛈️' };
}

function emojiOpenWeather(main: string): string {
  const m = main.toLowerCase();
  if (m.includes('clear')) return '☀️';
  if (m.includes('cloud')) return '☁️';
  if (m.includes('rain') || m.includes('drizzle')) return '🌧️';
  if (m.includes('thunder')) return '⛈️';
  if (m.includes('snow')) return '❄️';
  if (m.includes('mist') || m.includes('fog') || m.includes('haze')) return '🌫️';
  return '🌤️';
}

// Coopetencia: OpenWeather (requiere key activa). Devuelve null si falla.
async function intentarOpenWeather(
  lat: number,
  lon: number,
  fecha: string,
  key: string,
): Promise<Clima | null> {
  try {
    const hoy = new Date().toISOString().slice(0, 10);
    const diffDias = Math.round(
      (new Date(fecha).getTime() - new Date(hoy).getTime()) / 86_400_000,
    );

    // Forecast 5 días (3h) si la fecha cae en rango; si no, clima actual (aprox).
    if (diffDias >= 0 && diffDias <= 5) {
      const r = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${key}`,
        { cache: 'no-store' },
      );
      if (!r.ok) return null;
      const d = await r.json();
      const objetivo = `${fecha} 12:00:00`;
      const item =
        (d.list ?? []).find((x: { dt_txt: string }) => x.dt_txt === objetivo) ??
        (d.list ?? []).find((x: { dt_txt: string }) => x.dt_txt.startsWith(fecha)) ??
        d.list?.[0];
      if (!item) return null;
      return {
        fuente: 'OpenWeather',
        fecha,
        esEstimado: false,
        temp: Math.round(item.main.temp),
        tempMax: Math.round(item.main.temp_max),
        tempMin: Math.round(item.main.temp_min),
        descripcion: item.weather?.[0]?.description ?? '—',
        emoji: emojiOpenWeather(item.weather?.[0]?.main ?? ''),
        lluviaProb: item.pop != null ? Math.round(item.pop * 100) : null,
        viento: item.wind?.speed != null ? Math.round(item.wind.speed * 3.6) : null,
      };
    }

    const r = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${key}`,
      { cache: 'no-store' },
    );
    if (!r.ok) return null;
    const d = await r.json();
    return {
      fuente: 'OpenWeather',
      fecha,
      esEstimado: true,
      temp: Math.round(d.main.temp),
      tempMax: Math.round(d.main.temp_max),
      tempMin: Math.round(d.main.temp_min),
      descripcion: d.weather?.[0]?.description ?? '—',
      emoji: emojiOpenWeather(d.weather?.[0]?.main ?? ''),
      lluviaProb: null,
      viento: d.wind?.speed != null ? Math.round(d.wind.speed * 3.6) : null,
    };
  } catch {
    return null;
  }
}

// Respaldo sin key: Open-Meteo (fecha exacta hasta 16 días).
async function openMeteo(
  lat: number,
  lon: number,
  fecha: string,
): Promise<Clima> {
  try {
    const r = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max` +
        `&timezone=auto&start_date=${fecha}&end_date=${fecha}`,
      { cache: 'no-store' },
    );
    const d = await r.json();
    const daily = d.daily;
    if (daily?.time?.length) {
      const { descripcion, emoji } = desdeWMO(daily.weather_code[0] ?? 0);
      const max = daily.temperature_2m_max[0];
      const min = daily.temperature_2m_min[0];
      return {
        fuente: 'Open-Meteo',
        fecha,
        esEstimado: false,
        temp: max != null && min != null ? Math.round((max + min) / 2) : null,
        tempMax: max != null ? Math.round(max) : null,
        tempMin: min != null ? Math.round(min) : null,
        descripcion,
        emoji,
        lluviaProb: daily.precipitation_probability_max?.[0] ?? null,
        viento:
          daily.wind_speed_10m_max?.[0] != null
            ? Math.round(daily.wind_speed_10m_max[0])
            : null,
      };
    }
  } catch {
    /* cae al valor por defecto */
  }
  return {
    fuente: 'Open-Meteo',
    fecha,
    esEstimado: true,
    temp: null,
    tempMax: null,
    tempMin: null,
    descripcion: 'Sin datos para la fecha',
    emoji: '❓',
    lluviaProb: null,
    viento: null,
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get('lat'));
  const lon = Number(searchParams.get('lon'));
  const fecha =
    searchParams.get('fecha') || new Date().toISOString().slice(0, 10);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return Response.json({ error: 'lat/lon inválidos' }, { status: 400 });
  }

  const key = process.env.OPENWEATHER_API_KEY;
  if (key) {
    const ow = await intentarOpenWeather(lat, lon, fecha, key);
    if (ow) return Response.json(ow);
  }
  return Response.json(await openMeteo(lat, lon, fecha));
}
