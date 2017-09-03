// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const Datastore = require('@google-cloud/datastore');

const ds = require('@google-cloud/datastore')(
    // If not running in GCP, you need to specify credentials
    // {
    //   projectId: '<YOUR PROJECT ID>',
    //   keyFilename: <LOCAL PATH TO CREDENTIALS>
    // }
    );

const kind = 'GenericResource';

/**
 * Translates from the application's format to the datastore's
 * extended entity property format. It also handles marking any
 * specified properties as non-indexed. Does not translate the key.
 *
 * Application format:
 *   {
 *     id: id,
 *     property: value,
 *     unindexedProperty: value
 *   }
 *
 * Datastore extended format:
 *   [
 *     {
 *       name: property,
 *       value: value
 *     },
 *     {
 *       name: unindexedProperty,
 *       value: value,
 *       excludeFromIndexes: true
 *     }
 *   ]
 * @param {Object} obj - The object to translate to Datastore
 * @param {Object} nonIndexed - Sets whcih parameter is not indexed
 * @return {Object} the object ready to submit to Datastore
 */
function toDatastore(obj, nonIndexed) {
  nonIndexed = nonIndexed || [];
  const results = [];
  Object.keys(obj).forEach((k) => {
    if (obj[k] === undefined) {
      return;
    }
    results.push({
      name: k,
      value: obj[k],
      excludeFromIndexes: nonIndexed.indexOf(k) !== -1
    });
  });
  return results;
}

/**
 * Puts the resource on the key specified by id
 * @param {string} id - The unique identifier for the resource.
 * @param {Object} data - The entity to use.
 * @param {Function} cb - Standard error callback
 */
function put(id, data, cb) {
  let key = ds.key([kind, id]);
  const entity = {key: key, data: toDatastore(data, ['description'])};
  ds.save(entity, (err) => {
    data.id = entity.key.id;
    cb(err, err ? null : data);
  });
}

/**
 * Gets the resource on the key specified by id
 * @param {string} id - The unique identifier for the resource.
 * @param {Function} cb - Standard error callback
 */
function get(id, cb) {
  const key = ds.key([kind, id]);
  ds.get(key, (err, entity) => {
    if (err) {
      cb(err);
      return;
    }
    if (!entity) {
      cb({notFound: `The id ${id}`, code: 404, message: 'Not found'});
      return;
    }
    cb(null, entity);
  });
}

/**
 * Deletes the resource on the key specified by id
 * @param {string} id - The unique identifier for the resource.
 * @param {Function} cb - Standard error callback
 */
function _delete(id, cb) {
  const key = ds.key([kind, id]);
  ds.delete(key, cb);
}


module.exports = {
  get,
  put,
  del: _delete
};
