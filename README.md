# PDOK Webservices Workshop

## Online

View workshop instructions at [pdok.github.io/webservices-workshop/](https://pdok.github.io/webservices-workshop/).

## Locally

Workshop source lives in `src/WORKSHOP.md`. HTML can be generated in the folder `html` by running;

```
src/scripts/workshop-build.sh
```
Then serve workshop content locally with:

```
cd docs && python -m http.server 8000
```

Then visit [localhost:8000/index.html](http://localhost:8000/index.html).
