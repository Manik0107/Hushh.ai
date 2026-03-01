from __future__ import annotations

import argparse
import sys

from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel
from rich.prompt import Prompt
from rich.rule import Rule

from core.agent import build_agent

console = Console()


def print_banner() -> None:
    console.print(
        Panel.fit(
            "[bold cyan]PDF RAG Chatbot[/bold cyan]\n"
            "[dim]Powered by Agno · Gemini 2.5 Flash · pgvector[/dim]",
            border_style="bright_blue",
            padding=(1, 4),
        )
    )
    console.print(
        "[dim]Commands: '[bold]/reload[/bold]' · '[bold]/reset[/bold]' · "
        "'[bold]/help[/bold]' · '[bold]exit[/bold]'[/dim]\n"
    )


def print_help() -> None:
    console.print(
        Panel(
            "[bold]/reload[/bold]  - Re-ingest PDFs (keeps existing data)\n"
            "[bold]/reset[/bold]   - Wipe DB and re-ingest all PDFs\n"
            "[bold]/help[/bold]    - Show this message\n"
            "[bold]exit[/bold]     - Quit the chatbot",
            title="[cyan]Available Commands[/cyan]",
            border_style="cyan",
        )
    )


def run_chat(load_knowledge: bool = True, recreate: bool = False) -> None:
    print_banner()

    console.print("[dim]Initialising agent and loading knowledge base...[/dim]")

    try:
        agent = build_agent(load_knowledge=load_knowledge, recreate=recreate)
    except Exception as exc:
        console.print(f"[bold red]Failed to initialise:[/bold red] {exc}")
        sys.exit(1)

    console.print("[green]Ready! Ask me anything about your PDFs.[/green]\n")
    console.print(Rule(style="bright_blue"))

    while True:
        try:
            user_input = Prompt.ask("\n[bold cyan]You[/bold cyan]").strip()
        except (KeyboardInterrupt, EOFError):
            console.print("\n[dim]Goodbye![/dim]")
            break

        if not user_input:
            continue

        if user_input.lower() in ("exit", "quit"):
            console.print("[dim]Goodbye![/dim]")
            break

        if user_input.lower() == "/help":
            print_help()
            continue

        if user_input.lower() == "/reload":
            console.print("[dim]Reloading knowledge base...[/dim]")
            agent = build_agent(load_knowledge=True, recreate=False)
            console.print("[green]Knowledge base reloaded.[/green]")
            continue

        if user_input.lower() == "/reset":
            console.print("[yellow]Wiping and re-indexing the knowledge base...[/yellow]")
            agent = build_agent(load_knowledge=True, recreate=True)
            console.print("[green]Knowledge base reset and re-indexed.[/green]")
            continue

        console.print()
        with console.status("[bold green]Thinking...[/bold green]", spinner="dots"):
            try:
                response = agent.run(user_input, stream=False)
                answer = response.content if response and hasattr(response, "content") else str(response)
            except Exception as exc:
                console.print(f"[bold red]Error:[/bold red] {exc}")
                continue

        console.print(Rule("[dim]Assistant[/dim]", style="green"))
        console.print(Markdown(answer))
        console.print(Rule(style="dim"))


def main() -> None:
    parser = argparse.ArgumentParser(description="PDF RAG Chatbot CLI")
    parser.add_argument("--no-load", action="store_true", help="Skip PDF ingestion.")
    parser.add_argument("--recreate", action="store_true", help="Wipe and re-index all PDFs.")
    args = parser.parse_args()

    run_chat(load_knowledge=not args.no_load, recreate=args.recreate)


if __name__ == "__main__":
    main()
