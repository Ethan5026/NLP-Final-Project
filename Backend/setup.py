from setuptools import setup, find_packages

setup(
    name="cupul",
    version="0.0.1",
    description="CU-PUL NER utilities and training code",
    packages=find_packages(where="CuPUL/src"),
    package_dir={"": "CuPUL/src"},
    include_package_data=True,
)

