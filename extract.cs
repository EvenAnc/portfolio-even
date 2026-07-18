using System;
using System.IO;
using System.Text.RegularExpressions;

class Program {
    static void Main() {
        string logPath = @"C:\Users\evena\.gemini\antigravity\brain\6edcc6c0-25b3-4426-8849-2e1088c7b644\.system_generated\logs\transcript_full.jsonl";
        string[] lines = File.ReadAllLines(logPath);

        string best = "";

        foreach (string line in lines) {
            if (!line.Contains("index.html")) continue;
            if (!line.Contains("TargetFile")) continue;
            if (!line.Contains("projects-grid")) continue;

            var m = Regex.Match(line, @"(?s)""ReplacementContent"":""(.*?)""");
            if (m.Success) {
                string val = m.Groups[1].Value;
                if (val.Contains("projects-grid") && !val.Contains("fortiche-projects-board")) {
                    if (val.Length > best.Length) {
                        best = val;
                    }
                }
            }
        }

        if (best.Length > 0) {
            string unescaped = Regex.Unescape(best);
            File.WriteAllText("extracted_v1.txt", unescaped);
            Console.WriteLine("Found V1 length: " + unescaped.Length);
        } else {
            Console.WriteLine("V1 not found.");
        }
    }
}
