using System.Collections.Generic;

namespace WebAPI.DTOs
{
    /// <summary>
    /// Map of tutorialKey → seen (true/false).
    /// e.g. { "search": true, "booking": false }
    /// </summary>
    public class SeenTutorialsDTO : Dictionary<string, bool>
    {
    }
}
