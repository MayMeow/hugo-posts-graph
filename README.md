# Posts graph for Hugo

Generate data file for creating post graph from posts.

## Usage

Installation

```bash
npm i @themaymeow/rpo-api-client
```

Using in your script

```javascript
import stats from "@themaymeow/hugo-posts-graph/hugo.js";
stats.getDates("content/posts")
```
Script above will generate you new file `data/postGraph.json` which you can use for creating graph.
