using System;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNet.Builder;
using Microsoft.AspNet.Http;

namespace AJ2MVC
{
    public class ProxyOptions
    {
        public string Scheme { get; set; }
        public string Host { get; set; }
        public string HostPathBase { get; set; }
        public string Port { get; set; }
        public HttpMessageHandler BackChannelMessageHandler { get; set; }
    }
    public static class ProxyExtension
    {
        /// <summary>
        /// Sends request to remote server as specified in options
        /// </summary>
        /// <param name="app"></param>
        /// <returns></returns>
        public static IApplicationBuilder RunRhetosProxy(this IApplicationBuilder app)
        {
            if (app == null)
            {
                throw new ArgumentNullException(nameof(app));
            }

            return app.UseMiddleware<RhetosProxyMiddleware>();
        }

        /// <summary>
        /// Sends request to remote server as specified in options
        /// </summary>
        /// <param name="app"></param>
        /// <param name="options">Options for setting port, host, and scheme</param>
        /// <returns></returns>
        public static IApplicationBuilder RunRhetosProxy(this IApplicationBuilder app, ProxyOptions options)
        {
            if (app == null)
            {
                throw new ArgumentNullException(nameof(app));
            }
            if (options == null)
            {
                throw new ArgumentNullException("ProxyOptions");
            }

            return app.UseMiddleware<RhetosProxyMiddleware>(options);
        }
    }

    public class RhetosProxyMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly HttpClient _httpClient;
        private readonly ProxyOptions _options;

        public RhetosProxyMiddleware(RequestDelegate next, ProxyOptions options)
        {
            if (next == null)
            {
                throw new ArgumentNullException(nameof(next));
            }

            if (options == null)
            {
                throw new ArgumentNullException("ProxyOptions");
            }

            _next = next;
            _options = options;

            if (string.IsNullOrEmpty(_options.Host))
            {
                throw new ArgumentException("Options parameter must specify host.", "ProxyOptions");
            }

            // Setting default Port and Scheme if not specified
            if (string.IsNullOrEmpty(_options.Port))
            {
                if (string.Equals(_options.Scheme, "https", StringComparison.OrdinalIgnoreCase))
                {
                    _options.Port = "443";
                }
                else
                {
                    _options.Port = "80";
                }

            }

            if (string.IsNullOrEmpty(_options.Scheme))
            {
                _options.Scheme = "http";
            }

            if (string.IsNullOrEmpty(_options.HostPathBase))
                _options.HostPathBase = "";

            _httpClient = new HttpClient(_options.BackChannelMessageHandler ?? new HttpClientHandler());
        }

        public async Task Invoke(HttpContext context)
        {
            string uid = (Guid.NewGuid()).ToString().Substring(0, 8);
            if (context.Session.Keys.Contains("SessionID"))
            {
                uid = context.Session.GetString("SessionID");
            } else {
                context.Session.SetString("SessionID", uid);
            }
            var requestMessage = new HttpRequestMessage();
            if (!string.Equals(context.Request.Method, "GET", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(context.Request.Method, "HEAD", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(context.Request.Method, "DELETE", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(context.Request.Method, "TRACE", StringComparison.OrdinalIgnoreCase))
            {
                var streamContent = new StreamContent(context.Request.Body);
                requestMessage.Content = streamContent;
            }

            // Copy the request headers
            foreach (var header in context.Request.Headers)
            {
                if (!requestMessage.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray()) && requestMessage.Content != null)
                {
                    requestMessage.Content?.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
                }
            }

            requestMessage.Headers.Host = _options.Host + ":" + _options.Port;
            var uriString = $"{_options.Scheme}://{_options.Host}:{_options.Port}{_options.HostPathBase}{context.Request.Path}{context.Request.QueryString}";
            /*
            using (var rcb = new RestSharp.Portable.HttpClient.RestClient($"{_options.Scheme}://{_options.Host}:{_options.Port}")
            {
                Authenticator = new RestSharp.Portable.Authenticators.HttpDigestAuthenticator(AuthHeader.Www)
            }) {
                var response = await rcb.Execute(new RestRequest($"{_options.HostPathBase}{context.Request.Path}{context.Request.QueryString}", Method.GET));
            }
            */

            requestMessage.RequestUri = new Uri(uriString);
            requestMessage.Method = new HttpMethod(context.Request.Method);

            // TODO: clear this up - currently requests from different browser instances on same computer shared connection
            // TODO: rewrite this, it is temporary workaround, but it adds for opening and closing HTTP connection
            requestMessage.Headers.Connection.Clear();
            requestMessage.Headers.Connection.Add("close");

            using (var responseMessage = await _httpClient.SendAsync(requestMessage, HttpCompletionOption.ResponseHeadersRead, context.RequestAborted))
            {
                context.Response.StatusCode = (int)responseMessage.StatusCode;
                foreach (var header in responseMessage.Headers)
                {
                    context.Response.Headers[header.Key] = header.Value.ToArray();
                }

                foreach (var header in responseMessage.Content.Headers)
                {
                    context.Response.Headers[header.Key] = header.Value.ToArray();
                }

                // SendAsync removes chunking from the response. This removes the header so it doesn't expect a chunked response.
                context.Response.Headers.Remove("transfer-encoding");
                await responseMessage.Content.CopyToAsync(context.Response.Body);
            }
        }
    }    
}