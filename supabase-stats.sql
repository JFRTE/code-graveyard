-- Stats aggregation function (avoids fetching all records)
-- Run in Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_graveyard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total', (SELECT count(*) FROM tombstones),
    'totalFlowers', (SELECT COALESCE(sum(flower_count), 0) FROM tombstones),
    'totalEulogies', (SELECT COALESCE(sum(eulogy_count), 0) FROM tombstones),
    'totalCandles', (SELECT COALESCE(sum(candle_count), 0) FROM tombstones),
    'topCauses', (
      SELECT COALESCE(json_agg(row_to_json(t) ORDER BY t.cnt DESC), '[]'::json)
      FROM (
        SELECT cause_of_death as cause, count(*) as cnt
        FROM tombstones
        GROUP BY cause_of_death
        ORDER BY cnt DESC
        LIMIT 10
      ) t
    ),
    'topLanguages', (
      SELECT COALESCE(json_agg(row_to_json(t) ORDER BY t.cnt DESC), '[]'::json)
      FROM (
        SELECT language as lang, count(*) as cnt
        FROM tombstones
        GROUP BY language
        ORDER BY cnt DESC
        LIMIT 10
      ) t
    ),
    'monthly', (
      SELECT COALESCE(json_agg(row_to_json(t) ORDER BY t.month_key), '[]'::json)
      FROM (
        SELECT 
          to_char(d.month, 'FMYYYY-MM') as month_key,
          extract(month from d.month)::int || '月' as month,
          count(tombstones.id)::int as count
        FROM generate_series(
          date_trunc('month', now()) - interval '11 months',
          date_trunc('month', now()),
          interval '1 month'
        ) d(month)
        LEFT JOIN tombstones ON date_trunc('month', tombstones.created_at) = d.month
        GROUP BY d.month
        ORDER BY d.month
      ) t
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
