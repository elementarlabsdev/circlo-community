-- Add transcoding settings
INSERT INTO "Setting" ("id", "name", "category", "data")
VALUES
  ('maxSizeForTranscoding', 'maxSizeForTranscoding', 'upload', '{"value": 100}'),
  ('maxDurationForTranscoding', 'maxDurationForTranscoding', 'upload', '{"value": 10}')
ON CONFLICT ("name") DO NOTHING;
