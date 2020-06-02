/**
 * Module dependencies
 */
const FTP = require('ftp')
const imagemin = require('imagemin')
const imageminMozjpeg = require('imagemin-mozjpeg')
const imageminPngquant = require('imagemin-pngquant')

module.exports = {
  provider: 'FTP BOL',
  name: 'FTP BOL',
  auth: {
    host: {
      label: 'Host',
      type: 'text'
    },
    port: {
      label: 'Port',
      type: 'text'
    },
    user: {
      label: 'User',
      type: 'text'
    },
    password: {
      label: 'Password',
      type: 'password'
    },
    baseUrl: {
      label: 'Base URL',
      type: 'text'
    },
    basePath: {
      label: 'Base Path',
      type: 'text'
    }
    // secure: {
    //   label: "Secure",
    //   type: "checkbox",
    //   required: false,
    // },
  },
  init: config => {
    const { host, port, user, password, baseUrl, basePath } = config

    const ftp = new FTP()

    ftp.connect({
      host,
      port,
      user,
      password
    })

    const connection = new Promise((resolve, reject) => {
      ftp.on('ready', () => {
        resolve()
      })

      ftp.on('error', err => {
        reject(err)
      })
    })

    return {
      upload (file) {
        return new Promise((resolve, reject) => {
          connection.then(() => {
            ftp.list(basePath, (err, list) => {
              if (err) {
                return reject(err)
              }

              const originalFileName = file.name.split('.')[0] // removing the extension from the name

              let fileName = `${originalFileName}${file.ext}`
              let c = 0

              const compareNames = file => file.name === fileName

              while (list.some(compareNames)) {
                c += 1
                fileName = `${originalFileName}_${c}${file.ext}`
              }

              if (['.jpg', '.png'].includes(file.ext)) {
                return imagemin
                  .buffer(file.buffer, {
                    plugins: [
                      imageminMozjpeg({ quality: 50 }),
                      imageminPngquant({
                        quality: [0.6, 0.8]
                      })
                    ]
                  })
                  .then(outBuffer => {
                    ftp.append(outBuffer, `${basePath}${fileName}`, err => {
                      if (err) {
                        console.error(err)
                        return reject(err)
                      }

                      file.public_id = fileName
                      file.url = baseUrl + fileName
                      console.log('File uploaded:', fileName)

                      ftp.end()

                      return resolve()
                    })
                  }).catch(e => {
                    console.error(e)
                  })
              } else {
                ftp.append(file.buffer, `${basePath}${fileName}`, err => {
                  if (err) {
                    return reject(err)
                  }

                  file.public_id = fileName
                  file.url = baseUrl + fileName
                  console.log('File uploaded:', fileName)

                  ftp.end()

                  return resolve()
                })
              }
            })
          })
        })
      },
      delete (file) {
        return new Promise((resolve, reject) => {
          connection.then(() => {
            console.log('File to delete:', file.public_id)
            const success = ftp.ChangeRemoteDir(basePath)
            if (success) {
              ftp.delete(file.public_id, err => {
                if (err) {
                  return reject(err)
                }
                
                ftp.end()
  
                return resolve()
              })
            } else {
              console.error('Could not change dir to:', basePath)
            }
          })
        })
      }
    }
  }
}
