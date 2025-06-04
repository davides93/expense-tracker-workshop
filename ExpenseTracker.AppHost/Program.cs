var builder = DistributedApplication.CreateBuilder(args);

// Add the Node.js backend API
var backend = builder.AddNodeApp("backend", "../backend")
    .WithHttpEndpoint(port: 3001, env: "PORT")
    .WithEnvironment("NODE_ENV", "development")
    .WithEndpoint(3001, scheme: "http", name: "api");

// Add the React frontend web app 
var frontend = builder.AddNpmApp("frontend", "../frontend")
    .WithHttpEndpoint(port: 3000, env: "PORT")
    .WithReference(backend)
    .WithEnvironment("REACT_APP_API_URL", backend.GetEndpoint("api"));

builder.Build().Run();