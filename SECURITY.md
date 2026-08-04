# Security Policy

Thank you for helping keep Hyperion and its users safe. We take security seriously and appreciate the efforts of researchers and users who responsibly disclose vulnerabilities.

## Supported Versions

We release security fixes for the following versions of Hyperion. Please make sure you're running a supported version before reporting an issue.

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | ✅ Yes              |
| 0.x.x   | ❌ No (pre-release) |

Only the latest minor release within a supported major version receives security patches. We recommend always running the most recent release.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues, discussions, or pull requests.**

Instead, report them privately using one of the following methods:

### Preferred: GitHub Private Vulnerability Reporting

1. Go to the [Security tab](../../security) of this repository
2. Click **"Report a vulnerability"**
3. Fill in as much detail as you can (see [What to Include](#what-to-include) below)

This creates a private advisory visible only to maintainers until it's resolved.

### Alternative: Email

If you're unable to use GitHub's reporting tool, email us at:

**security@hyperion.dev**

Please include "SECURITY" in the subject line. If you'd like to encrypt your report, ask us for a PGP key in an initial, non-sensitive email.

### What to Include

To help us triage and fix the issue quickly, please provide:

- A clear description of the vulnerability and its potential impact
- Steps to reproduce, or a proof-of-concept if available
- The affected component (e.g. desktop app, web app, terminal/PTY layer, agent runtime, WebSocket server)
- The version or commit hash you tested against
- Any relevant logs, screenshots, or stack traces

The more detail you provide, the faster we can confirm and resolve the issue.

## What to Expect

| Stage | Timeline |
|---|---|
| Acknowledgment of your report | Within 3 business days |
| Initial assessment & severity triage | Within 7 business days |
| Status updates while we work on a fix | At least every 14 days |
| Public disclosure | Coordinated with you, after a fix is released |

We follow a **coordinated disclosure** process: we ask that you give us a reasonable amount of time to investigate and patch a vulnerability before any public disclosure, and we commit to keeping you updated throughout.

If a report is accepted, we will credit you (unless you prefer to remain anonymous) in the release notes and/or a security advisory once a fix ships.

## Scope

This policy covers the **Hyperion application**, which is open source and maintained in this repository:

- Desktop client (Tauri 2)
- Web client (Next.js)
- Shared packages (`packages/core`, `packages/ui`, `packages/cli`, etc.)
- Terminal/PTY handling, agent spawning, and WebSocket communication code contained in this repository

### Out of Scope

- The Hyperion website and hosted/cloud dashboard, which are maintained in a **private repository** and have their own security process — please contact **security@hyperion.dev** if you find an issue there and we'll route it appropriately
- Vulnerabilities in third-party dependencies (please report these upstream, and optionally let us know so we can track and patch)
- Issues requiring physical access to a user's device
- Social engineering, phishing, or spam
- Denial-of-service attacks against local processes you control on your own machine

## Severity Guidelines

We use the following as a rough guide when triaging reports:

- **Critical** — Remote code execution, arbitrary file read/write outside the workspace sandbox, credential/token exfiltration
- **High** — Privilege escalation between workspaces, PTY/agent process escape, unauthorized access to another workspace's data
- **Medium** — Denial of service, information disclosure not involving credentials, insecure defaults
- **Low** — Best-practice deviations with minimal real-world impact

Actual severity is assessed case-by-case using [CVSS](https://www.first.org/cvss/) as a reference, not a strict formula.

## Security Best Practices for Users

While we work to keep Hyperion secure by design, you can reduce your own risk by:

- Keeping Hyperion updated to the latest supported version
- Only installing agent plugins or extensions from sources you trust
- Reviewing any prompt or agent configuration before running it against sensitive codebases
- Not sharing your Hyperion workspace database or exported prompts/tasks if they contain secrets or credentials

## Questions

For general (non-security) questions, please use [GitHub Discussions](../../discussions) instead of the security email so the team can respond in public and help others with the same question.

---

Thank you for helping keep the Hyperion community safe.
