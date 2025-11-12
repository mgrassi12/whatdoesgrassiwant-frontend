# What Does Grassi Want? - Frontend Repo

![Screenshot of the What Does Grassi Want website.](.\what-does-grassi-want.png)

Front-end for [whatdoesgrassiwant.com](https://www.whatdoesgrassiwant.com), a simple wishlist site for sharing ideas with friends and family.

This repository includes:

- Static frontend (HTML, CSS, JavaScript)
- Terraform for:
  - Azure Resource Group for frontend
  - Azure DNS zone for `whatdoesgrassiwant.com`
  - Azure Static Web App (Free tier)
  - Using a custom domain `www.whatdoesgrassiwant.com` with HTTPS

The frontend connects to the backend API from `whatdoesgrassiwant-backend`.

---

## Architecture

Azure resources created by this repo: 
- **Resource Group:** `rg-whatdoesgrassiwant-frontend`
- **DNS Zone:** `whatdoesgrassiwant.com`
- **Static Web App:** `swa-whatdoesgrassiwant`
- **CNAME Record:** `www.whatdoesgrassiwant.com` → `<default-host>.azurestaticapps.net`
- **Custom Domain:** TLS-managed `www.whatdoesgrassiwant.com`

High-level flow:

1. Visitor navigates to `https://www.whatdoesgrassiwant.com`.
2. Azure Static Web Apps serves files from `website/`.
3. `app.js` fetches data from  
   `https://func-whatdoesgrassiwant-api.azurewebsites.net/api/wishlist`.
4. JSON from backend is rendered as wishlist cards.

---

## Frontend behaviour

The frontend fetches and displays wishlist items as cards with:

- Item name  
- Description  
- Price in AUD  
- Product image  
- External link  

The API URL is set in `website/app.js`:

```js
const API_URL = "https://func-whatdoesgrassiwant-api.azurewebsites.net/api/wishlist";
```

For local testing, you can switch it to `"wishlist-example.json"`.

---

## Terraform setup

Terraform defines all frontend infrastructure inside `infra/`.

### Variables

Key variables in `variables.tf`:

- `project_name` – resource name prefix (`whatdoesgrassiwant`)
- `location` – Azure region (e.g. `australiaeast`)
- `domain_name` – `whatdoesgrassiwant.com`
- `static_web_app_location` – must be one of: `eastasia`, `westeurope`, `eastus2`, `centralus`, `westus2`

### Remote state

`backend.tf` stores Terraform state in an Azure Storage account:

```hcl
terraform {
  backend "azurerm" {
    resource_group_name  = "rg-terraform-state"
    storage_account_name = "sttfstategrassi"
    container_name       = "tfstate"
    key                  = "wishlist-frontend.tfstate"
  }
}
```

---

## Domain delegation (GoDaddy → Azure DNS)

1. Copy the four Azure DNS nameservers from the Azure DNS Zone
2. In GoDaddy DNS settings:
   - Choose “Custom Nameservers”
   - Paste the four Azure DNS servers
3. Wait for DNS propagation  
   (Check with `nslookup -type=ns whatdoesgrassiwant.com`)

---

## Static Web App content deployment

Terraform creates the infrastructure, but content is deployed via the Static Web Apps CLI.

### Install CLI

```bash
npm install -g @azure/static-web-apps-cli
```

### Get deployment token

```bash
az staticwebapp secrets list \
  --name swa-whatdoesgrassiwant \
  --resource-group rg-whatdoesgrassiwant-frontend \
  --query "properties.apiKey" -o tsv
```

### Deploy site

```bash
cd whatdoesgrassiwant-frontend
swa deploy ./website --env production --deployment-token "<token>"
```

Re-run the command when files in `website/` change.

---

## Backend API expectation

The frontend expects the backend endpoint:

```
GET https://func-whatdoesgrassiwant-api.azurewebsites.net/api/wishlist
```

It should return JSON like:

```json
{
  "id": 1,
  "name": "Bike helmet",
  "price_in_aud": 32.0,
  "description": "Adult bike helmet...",
  "url": "https://example.com",
  "imageUrl": "https://example.com/image.jpg",
  "dateAdded": "2025-11-12T03:10:37"
}
```

---

## Still to do
- Create Github Actions CI/CD automations for:
    - Creating/updating infrastructure
    - Destroying infrastructure
    - Updating the website content (SWA)
    - Tests
    - Cloud security and code hygiene checks
- Implement some form of monitoring and cost mgmt.
- Setup a separate subscription to use as a nonprod environment. Have a nonprod -> prod flow managed by PRs that require passing tests to merge. 
- Implement light mode and dark mode.
- Add ability to store and filter wishlisted items for multiple users in the household.
- Create an easier way to add items to the wishlist.
- Improve the formatting on mobile devices.
- Resize the pictures so that they fit in each card properly.