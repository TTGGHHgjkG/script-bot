exports.run = {
   usage: ['claim', 'klaim'],
   category: 'user info',
   async: async (m, {
      client,
      isPrefix,
      blockList,
      env,
      Func,
      setting
   }) => {
      let user = global.db.users.find(v => v.jid == m.sender)
      let timeClaim = 36000000
      let claimed = new Date(user.lastclaim + timeClaim)
      let timeout = claimed - new Date()
      if (new Date - user.lastclaim > timeClaim) {
         client.sendMessageModify(m.chat, `*Selamat!*, kamu mendapatkan *25 limit* dan  *1 juta point*`, m, {
            largeThumb: true,
            thumbnail: setting.cover
         })
         user.point += 1000000
         user.limit += 25
         user.lastclaim = new Date() * 1
      } else {
         client.sendMessageModify(m.chat, `Kamu sudah melakukan *claim* silahkan klaim kembali di jam berikutnya\n\n*⏱️ : ${Func.toTime(timeout)}️*`, m, {
            largeThumb: true,
            thumbnail: setting.cover
         })
      }
   },
   error: false,
   cache: true,
   location: __filename
}