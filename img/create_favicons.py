import os
import shutil
import subprocess
from typing import List, Text

import click


FILE_NAME = 'trident.svg'


def run_cmd(args: List[Text]):
    click.secho(' '.join(args), fg='green')
    return subprocess.run(args)


if __name__ == '__main__':
    if shutil.which('magick') is None:
        raise RuntimeError('Unable to find magick on the PATH')

    fav_sizes = [72, 36, 16]
    apple_sizes = [57, 60, 72, 76, 114, 120, 144, 152, 180]

    cmd = ['magick', 'convert', FILE_NAME, '-size']

    def sz_arg(s):
        return '{0}x{0}'.format(s)

    click.secho('Creating default favicon', fg='red')
    run_cmd(cmd + [sz_arg(72), 'favicon.ico'])
    for sz in fav_sizes:
        run_cmd(cmd + [sz_arg(sz), 'favicon{0}.ico'.format(sz)])

    click.secho('Creating default apple-touch-icon', fg='red')
    for sz in apple_sizes:
        run_cmd(cmd + [sz_arg(sz), 'apple-touch-icon-{0}.png'.format(sz)])

    click.secho('Copying favicon', fg='red')
    fav_path = os.path.join(os.path.realpath('..'), 'favicon.ico')
    shutil.copyfile(os.path.abspath('favicon.ico'), fav_path)
