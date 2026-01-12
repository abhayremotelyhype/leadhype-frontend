namespace LeadHype.Api;

public class DI
{
    static DI()
    {
        AssemblyName = typeof(DI).Assembly.GetName().Name;
    }

    public static string AssemblyName { get; set; }
    public static IServiceProvider ServiceProvider { get; set; }
    public static ILoggerFactory? LoggerFactory { get; set; }

    public static void Build(string basePath)
    {
        // Logging is now handled by built-in ASP.NET Core logging
        // No need for custom file logger
    }
}