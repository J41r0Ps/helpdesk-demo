# ADR 0001 — How the helpdesk stays in sync with the ticket system

- **Status:** Accepted
- **Date:** TODO (the day you write it)

## Context

Support agents keep working in the external ticket system, which stays the source of truth.
When an agent replies to a ticket or changes its status, the customer must see it in the helpdesk module.

## Options considered

| Option | Pros | Cons |
| --- | --- | --- |
| **Polling** (ask every N seconds) | Simple, no public endpoint needed | Delay up to N seconds; many useless requests; load grows with the number of tickets |
| **Webhooks** (ticket system calls us) | Near real-time; no wasted requests | Needs a public endpoint, signature checks, and handling of retries and duplicates |
| **Message queue** (events via a broker) | Decouples both systems; no lost events when one side is down | Extra infrastructure to run and monitor; more moving parts |

## Decision

TODO — write this in your own words. Which option, and why for THIS situation?
Hint: think about what the ticket system supports, the number of tickets, and what happens when your app is down.

## Consequences

TODO — what does this decision make easier, and what new risks or work does it bring?
(e.g. what if a webhook is missed? how do duplicates behave?)
