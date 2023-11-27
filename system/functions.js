const { Function: Func } = new(require('@neoxr/wb'))
const axios = require(‘axios')
const fetch = require('node-fetch' )
const cheerio = require('‘cheerio' )
const fs = require('fs')
conat mime = require('mime-types' )
const chalk = require( ‘chalk’ )
const path = require('path')
const FormData = require('form-data’' )
const { fromBuffer } = require('file-type')
const { green, blueBright, redBright } = require('chalk')
const { tmpdir } = require('os’)
const moment = require('moment-timezone')
moment .tz.setDefault(process.env.TZ)
NodeID3 = require('node-id3')
const {
  read,
  MIME_JPEG,
  RESIZE_BILINEAR,
  AUTO.
} = require('jimp')

class Function {
   h2k = (integer) => {
      try {
         let SI_POSTFIXES = ['', ' Ribu', ' Juta', ' Miliar', ' Triliun', ' Kuadriliun', ' Kuintiliun', ' Sektiliun', ' Septiliun', ' Oktiliun', ' Noniliun', ' Desiliun', ' Undesiliun', ' Duodesiliun', ' Tredesiliun', ' Kuattodesiliun', ' Kuindesiliun', ' Gogolchunk', ' Gogol', ' Sekdesiliun', ' Septemdesiliun', ' Oktodesiliun', ' Novemdesiliun', ' Vigintiliun', ' Unvigintiliun', ' Duovigintiliun', ' Trevigintiliun', ' Mikriliun', ' Pentesiliun', ' Ikosiliun', ' Triakontiliun', ' Xoniliun', ' Tetresiliun', ' Googolplex']
         let number = Number(integer).toLocaleString()
         let dot = number.match(/,/g)
         let split = number.split(',')
         let zero = parseInt(split[1].substring(1, -split[1].length))
         let postfix
         for (let i = 0; i < SI_POSTFIXES.length; i++)
            if (dot.filter(v => v == ',').length == i) postfix = SI_POSTFIXES[i]
         switch (true) {
            case zero != 0:
               var output = split[0] + '.' + zero + postfix
               break
            default:
               var output = split[0] + postfix
         }
         return output
      } catch {
         return integer
      }
   }

   ghstalk = (username) => {
      return new Promise(async (resolve) => {
         try {
            let json = await Func.fetchJson('https://api.github.com/users/' + username)
            if (typeof json.message != 'undefined') return resolve({
               creator: global.creator,
               status: false
            })
            resolve({
               creator: global.creator,
               status: true,
               data: json
            })
         } catch (e) {
            console.log(e)
            return resolve({
               creator: global.creator,
               status: false
            })
         }
      })
   }
}

exports.Function = Function