class TrieNode {
    constructor() {
        this.children = {};
        this.isEndOfWord = false;
        this.data = null;
    }
}

export class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word, data) {
        let current = this.root;
        for (const char of word) {
            if (!current.children[char]) {
                current.children[char] = new TrieNode();
            }
            current = current.children[char];
        }
        current.isEndOfWord = true;
        current.data = data;
    }

    findCompletions(prefix) {
        let current = this.root;
        for (const char of prefix) {
            if (!current.children[char]) {
                return []; // No completions if prefix not found
            }
            current = current.children[char];
        }
        return this._findWordsFromNode(current, prefix);
    }

    _findWordsFromNode(node, prefix) {
        let results = [];
        if (node.isEndOfWord) {
            results.push({ word: prefix, data: node.data });
        }
        for (const char in node.children) {
            results = results.concat(this._findWordsFromNode(node.children[char], prefix + char));
        }
        return results;
    }

    getAllEntries() {
        return this._getAllEntriesFromNode(this.root, "");
    }

    _getAllEntriesFromNode(node, prefix) {
        let entries = [];
        if (node.isEndOfWord) {
            entries.push({ word: prefix, data: node.data });
        }
        for (const char in node.children) {
            entries = entries.concat(this._getAllEntriesFromNode(node.children[char], prefix + char));
        }
        return entries;
    }

    findMatches(searchTerm) {
        return this._findMatchesFromNode(this.root, "", searchTerm);
    }

    _findMatchesFromNode(node, currentWord, searchTerm) {
        let results = [];
        if (node.isEndOfWord && currentWord.includes(searchTerm)) {
            results.push({ word: currentWord, data: node.data });
        }
        for (const char in node.children) {
            results = results.concat(this._findMatchesFromNode(node.children[char], currentWord + char, searchTerm));
        }
        return results;
    }
}