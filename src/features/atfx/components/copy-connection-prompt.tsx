import { useState } from 'react'
import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { atfxEnv } from '@/lib/atfx-api/env'

// Self-contained prompt so any AI agent can connect to the read-only ATFX
// data API and iterate. Credentials come from the (already client-side) env.
function buildConnectionPrompt(): string {
  const base = `${atfxEnv.apiUrl}/api`
  const token = atfxEnv.apiToken
  return `You have read-only access to the ATFX Salesforce CRM data API. Connect and iterate on the data to answer questions.

CONNECTION
- Base URL: ${base}
- Auth: send header  Authorization: Bearer ${token}
- Content-Type: application/json for POST bodies

ENDPOINTS
- POST /query       body {"query":"<SOQL SELECT>"}   raw SOQL — supports GROUP BY, CALENDAR_YEAR/MONTH, DAY_ONLY, LAST_N_DAYS:n
- POST /aggregate   body {"object","groupBy":[fields],"filters":{status|country},"orderBy":"asc|desc","limit"}   grouped COUNT(Id) as cnt
- GET  /describe/{sObject}     fields, types and picklist values
- GET  /search?object=Lead&status=&country=&ownerName=&days=&limit=   filtered records
- GET  /org         connected org / user info

DATA MODEL (read-only — never claim to write)
- Objects: Lead, Account, Contact. There is NO Opportunity object.
- Pipeline: Lead -> Account. "BDM" = the record Owner; group/filter by Owner.Name (display) or OwnerId (id).
- Country = ISO-3 picklists: Lead.Country_of_Residence_Lead__c, Account.Country_of_Residence_Account__c, Contact.Country_of_Residence__c.
- Lead.Status: Not Used Demo | Used Demo | Interested to Open Account | Pending Submitted Application | Live | Stage 6 - Dead.
- Account.Type: Client | IB. Account.Client_Source__c: Direct Client | Direct IB | IB Client | IB By IB. Account.Is_Test_Account__c excludes test rows.
- Account is large (~55k). Always scope with WHERE / LIMIT and prefer GROUP BY / COUNT() over pulling rows.
- Note: Lead.IsConverted and Account First_Deposit_Date / First_Trade_Date are currently empty org-wide.

EXAMPLE
curl -s -X POST "${base}/query" \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json" \\
  -d '{"query":"SELECT Owner.Name n, COUNT(Id) c FROM Account WHERE Is_Test_Account__c = false GROUP BY Owner.Name ORDER BY COUNT(Id) DESC LIMIT 10"}'

Start by calling /org to confirm the connection, then explore with /describe and iterate with /query and /aggregate.`
}

export function CopyConnectionPrompt() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildConnectionPrompt())
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard unavailable (insecure context / denied) — fail silently
    }
  }

  return (
    <Button
      variant='outline'
      size='sm'
      onClick={handleCopy}
      title='Copy an AI connection prompt (API URL, token, endpoints & data model) to the clipboard'
    >
      {copied ? <Check className='size-4' /> : <Sparkles className='size-4' />}
      {copied ? 'Copied' : 'Copy AI prompt'}
    </Button>
  )
}
