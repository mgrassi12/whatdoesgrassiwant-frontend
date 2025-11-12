resource "azurerm_resource_group" "frontend" {
  name     = "rg-${var.project_name}-frontend"
  location = var.location

  tags = {
    project    = var.project_name
    part       = "frontend"
    env        = "prod"
    created_by = "terraform"
  }
}

resource "azurerm_dns_zone" "root" {
  name                = var.domain_name          
  resource_group_name = azurerm_resource_group.frontend.name
}

resource "azurerm_static_web_app" "frontend" {
  name                = "swa-${var.project_name}"
  resource_group_name = azurerm_resource_group.frontend.name
  location            = "westus2" # would use azurerm_resource_group.frontend.location here but static web apps are not offered in australiaeast yet. 

  sku_tier = "Free"
  sku_size = "Free"

  tags = {
    project    = var.project_name
    part       = "frontend"
    env        = "prod"
    created_by = "terraform"
  }
}

resource "azurerm_dns_cname_record" "www" {
  name                = "www"
  zone_name           = azurerm_dns_zone.root.name
  resource_group_name = azurerm_resource_group.frontend.name
  ttl                 = 300

  record = azurerm_static_web_app.frontend.default_host_name
}

resource "azurerm_static_web_app_custom_domain" "www" {
  static_web_app_id = azurerm_static_web_app.frontend.id
  domain_name       = "www.${azurerm_dns_zone.root.name}"
  validation_type   = "cname-delegation"

  depends_on = [
    azurerm_dns_cname_record.www
  ]
}