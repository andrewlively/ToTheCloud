#ToTheCloud

File hosting application

## Dependencies:
  - [MongoDB](http://www.mongodb.org/)
  - [Node.js](http://nodejs.org/)
  - [Redis](http://redis.io/)

## Installation
    // Clone, change directory, install node dependencies
    git clone https://github.com/andrewlively/ToTheCloud.git && cd ToTheCloud && npm install
    
    // Run application
    node cloud_server.js
    
## Features
  - Single-role user management
  - File storage
  - Folder creation
  - File preview (currently only support for images; more to come)

## Next Steps
  - Support for multiple roles
    - Start with predefined then eventually customizable
  - Better file upload
    - Upload progress bar
    - Remove page reload after upload
  - Abstract file storage to allow other options (first will be AWS)
    - Currently hardcoded to use local file system
  - Add code tests
