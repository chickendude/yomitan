/*
 * Copyright (C) 2016  Alex Yatskov <alex@foosoft.net>
 * Author: Alex Yatskov <alex@foosoft.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


class Dictionary {
    constructor() {
        this.termDicts = {};
        this.kanjiDicts = {};
        this.db = new Dexie('dict');
        this.dbVer = 1;
    }

    loadDb() {
        return this.db.open().then((db) => {
            if (db.verno !== this.dbVer) {
                Promise.reject('db version mismatch');
            }

            return db.verno;
        });
    }

    importTermDict(name, dict) {
        this.termDicts[name] = dict;
    }

    importKanjiDict(name, dict) {
        this.kanjiDicts[name] = dict;
    }

    findTerm(term) {
        let results = [];

        for (const name in this.termDicts) {
            const dict = this.termDicts[name];
            if (!(term in dict.i)) {
                continue;
            }

            const indices = dict.i[term].split(' ').map(Number);
            results = results.concat(
                indices.map(index => {
                    const [e, r, t, ...g] = dict.d[index];
                    return {
                        expression: e,
                        reading:    r,
                        tags:       t.split(' '),
                        glossary:   g,
                        entities:   dict.e,
                        id:         index
                    };
                })
            );
        }

        return results;
    }

    findKanji(kanji) {
        const results = [];

        for (const name in this.kanjiDicts) {
            const def = this.kanjiDicts[name].c[kanji];
            if (def) {
                const [k, o, t, ...g] = def;
                results.push({
                    character: kanji,
                    kunyomi:   k.split(' '),
                    onyomi:    o.split(' '),
                    tags:      t.split(' '),
                    glossary:  g
                });
            }
        }

        return results;
    }
}
