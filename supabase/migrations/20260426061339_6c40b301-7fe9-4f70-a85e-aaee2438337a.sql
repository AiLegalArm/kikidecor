UPDATE public.ai_provider_settings
SET 
  model_reasoning = 'google/gemini-2.5-pro',
  model_fast = 'google/gemini-2.5-flash-lite',
  model_vision = 'google/gemini-2.5-flash',
  model_image = 'google/gemini-2.5-flash-image',
  notes = 'Бюджетный пресет: оптимальное соотношение цена/качество (~$0.25 на лида без видео)',
  updated_at = now()
WHERE is_active = true;