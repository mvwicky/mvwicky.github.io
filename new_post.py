#! python3.6
from datetime import datetime
from pathlib import Path
from typing import Text, TextIO

import click


DT_FMT = '%Y-%m-%d'
DT_HELP = 'YYYY-MM-DD'
NOW = datetime.now().strftime(DT_FMT)


def writeln(file: TextIO, line: Text) -> int:
    return file.write(line + '\n')


def validate_pubdate(ctx, param, value):
    try:
        datetime.strptime(value, DT_FMT)
    except ValueError:
        raise click.BadParameter('date must be in format: ' + DT_FMT)
    else:
        return value


def write_front_matter(
    file: Path,
    layout: Text,
    title: Text = 'PLACEHOLDER TITLE',
    date: Text = NOW,
) -> int:
    ret = 0
    with file.open('wt', encoding='utf-8') as f:
        ret += writeln(f, '---')
        ret += writeln(f, 'layout: {0}'.format(layout))
        ret += writeln(f, 'title: "{0}"'.format(title))
        ret += writeln(f, 'date: {0}'.format(date))
        ret += writeln(f, '---')
    return ret


@click.group()
def cli():
    pass


@cli.command()
@click.option('--title', default='placeholder')
@click.option(
    '--date',
    callback=validate_pubdate,
    default=NOW,
    help='date formatted as {0}'.format(DT_HELP),
)
def post(title: Text, date: Text):
    pass


@cli.command()
@click.option('--title', default='placeholder')
@click.option(
    '--date',
    callback=validate_pubdate,
    default=NOW,
    help='date formatted as {0}'.format(DT_HELP),
)
def links(title: Text, date: Text):
    title = title.title()
    file_name = '{0}-{1}.md'.format(date, title.replace(' ', '-'))
    file_path = Path('_posts') / file_name

    if file_path.is_file():
        raise click.ClickException(
            'file already exists ({0})'.format(file_path)
        )

    b = write_front_matter(file_path, 'somelinks', date=date)
    click.secho('Created new file: {0} ({1})'.format(file_path, b), fg='green')


if __name__ == '__main__':
    cli()
