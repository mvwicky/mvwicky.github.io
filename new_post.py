#! python3.6
from datetime import datetime
from pathlib import Path
from typing import Text, TextIO

import click


DT_FMT = '%Y-%m-%d'
NOW = datetime.now().strftime(DT_FMT)


def writeln(file: TextIO, line: Text):
    file.write(line)
    file.write('\n')


def validate_pubdate(ctx, param, value):
    try:
        datetime.strptime(value, DT_FMT)
    except ValueError:
        raise click.BadParameter('date must be in format: ' + DT_FMT)
    else:
        return value


@click.group()
def cli():
    pass


@cli.command()
@click.option('--title', default='placeholder')
@click.option('--pub-date', callback=validate_pubdate, default=NOW)
def links(title: Text, pub_date: Text):
    title = title.title()
    file_name = '{0}-{1}.md'.format(pub_date, title.replace(' ', '-'))
    file_path = Path('_posts') / file_name

    if file_path.is_file():
        raise click.ClickException(
            'file already exists ({0})'.format(file_path)
        )

    with file_path.open('wt', encoding='utf-8') as f:
        writeln(f, '---')
        writeln(f, 'layout: somelinks')
        writeln(f, 'title: "PLACEHOLDER TITLE"')
        writeln(f, 'date: {0}'.format(pub_date))
        writeln(f, '---')
    click.secho('Created new file: {0}'.format(file_path), fg='green')


if __name__ == '__main__':
    cli()
