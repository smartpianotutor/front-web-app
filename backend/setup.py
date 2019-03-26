import io

from setuptools import find_packages, setup

with io.open('README.rst', 'rt', encoding='utf8') as f:
    readme = f.read()

setup(
    name='pianotutor',
    version='0.0.1',
    maintainer='RAN team',
    description='Backend for Piano Tutor.',
    long_description=readme,
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    install_requires=[
        'flask',
        'wheel',
        'music21',
        'numpy',
        'scipy',
    ],
    extras_require={
        'test': [
            'pytest',
            'coverage',
        ],
    },
)
