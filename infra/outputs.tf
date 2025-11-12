output "dns_nameservers" {
  description = "Name servers for this DNS zone (set these at GoDaddy if not done already)"
  value       = azurerm_dns_zone.root.name_servers
}

output "static_web_app_default_hostname" {
  description = "Default hostname for the Static Web App"
  value       = azurerm_static_web_app.frontend.default_host_name
}

output "static_web_app_custom_domain" {
  description = "Custom domain bound to the Static Web App"
  value       = azurerm_static_web_app_custom_domain.www.domain_name
}