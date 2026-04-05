using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace WebAPI.Services
{
    public interface IGeminiService
    {
        /// <summary>
        /// Given a description and a list of existing category names,
        /// returns up to 3 names from that list that best match.
        /// </summary>
        Task<List<string>> SuggestCategoryNamesAsync(string description, IEnumerable<string> categoryNames);

        /// <summary>
        /// Given a description, asks the AI to propose a generic category name
        /// and a Material icon name.
        /// Returns (name, iconName). Both may be null if the call fails.
        /// </summary>
        Task<(string? Name, string? IconName)> GenerateCategoryNameAsync(string description);
    }

    public class GeminiService : IGeminiService
    {
        private readonly HttpClient _http;
        private readonly string _apiKey;
        private const string BaseUrl =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

        public GeminiService(HttpClient http, IConfiguration config)
        {
            _http = http;
            _apiKey = config["Gemini:ApiKey"] ?? throw new InvalidOperationException("Gemini:ApiKey is not configured.");
        }

        public async Task<List<string>> SuggestCategoryNamesAsync(string description, IEnumerable<string> categoryNames)
        {
            var nameList = string.Join("\n", categoryNames);
            var prompt = $"""
                You are a category classifier for a local business booking app.
                Given the list of available categories and a service description, return the 1–3 best matching category names from the list.

                Rules:
                - ONLY use names from the provided list — no new names, no changes to spelling
                - Return 1 to 3 names, one per line, nothing else
                - If nothing fits at all, return exactly: NONE

                Available categories:
                {nameList}

                Service description: {description}
                """;

            var text = await CallGeminiAsync(prompt, maxTokens: 80);
            if (string.IsNullOrWhiteSpace(text) || text.Trim() == "NONE")
                return [];

            return text
                .Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Where(line => !string.IsNullOrWhiteSpace(line))
                .Take(3)
                .ToList();
        }

        public async Task<(string? Name, string? IconName)> GenerateCategoryNameAsync(string description)
        {
            var prompt = $"""
                You are naming service categories for a local business booking directory.
                Based on the description below, propose a concise, generic, reusable category name and a Google Material Icon name.

                Rules:
                - The name must be generic (e.g. "Personal Training" not "John's Gym Sessions"), 2–4 words max
                - Return EXACTLY two lines: line 1 = category name, line 2 = Material icon name in snake_case
                - Keep the icon simple and real (e.g. fitness_center, spa, content_cut, local_hospital, restaurant)

                Description: {description}
                """;

            var text = await CallGeminiAsync(prompt, maxTokens: 60);
            if (string.IsNullOrWhiteSpace(text)) return (null, null);

            var lines = text
                .Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .ToArray();

            var name = lines.Length > 0 ? lines[0] : null;
            var icon = lines.Length > 1 ? lines[1] : null;

            return (name, icon);
        }

        private async Task<string?> CallGeminiAsync(string prompt, int maxTokens)
        {
            var url = $"{BaseUrl}?key={_apiKey}";

            var body = new
            {
                contents = new[]
                {
                    new { parts = new[] { new { text = prompt } } }
                },
                generationConfig = new
                {
                    temperature = 0.0,
                    maxOutputTokens = maxTokens
                }
            };

            var json = JsonSerializer.Serialize(body);
            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Content = new StringContent(json, Encoding.UTF8, "application/json");

            using var response = await _http.SendAsync(request);
            if (!response.IsSuccessStatusCode) return null;

            var responseJson = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseJson);

            return doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();
        }
    }
}
