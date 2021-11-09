module.exports = {
	'*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
	'{!(package)*.json,*.code-snippets,.!(browserslist)*rc}': ['prettier --write--parser json'],
	'package.json': ['prettier --write'],
	'*.md': ['prettier --write']
}