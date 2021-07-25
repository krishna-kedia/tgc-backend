const express = require("express");
const router = express.Router();
const cors = require('cors')
const mongoose = require("mongoose");
const multer = require("multer");
const {GoogleSpreadsheet} = require("google-spreadsheet")

require("./../models/chapter");
require("./../models/workshop");
require("./../models/user");

const Chapter = mongoose.model("Chapter");
const Workshop = mongoose.model("Workshop");
const User = mongoose.model("User");

//create a chapter
router.post(
  "/create-chapter", cors(),
  //upload.single('image'),
  async (req, res, next) => {
    console.log(req.body);
    const {
      chapterName,
      image,
      carouselImages,
    } = req.body;
    console.log("hi");
    try {
      const chapter = await Chapter.create({
        chapterName,
        image,
        carouselImages,
      });
      res.status(200).json({ message: "chapter created", chapter, done: true });
    } catch (error) {
      console.log(error);
      //next();
    }
  }
);

//get all chapters
router.get("/chapters", cors(),async (req, res) => {
  try {
    let stat1, stat2, stat3, arr = []
    const chapters = await Chapter.find({});
    const workshops = await Workshop.find({})
    stat1 = chapters.length
    stat3 = workshops.length
    chapters.map((chapter) => {
      arr.push(chapter.flagshipStatValue2)
    })
    console.log(arr)
    stat2 = await arr.reduce((a, b) => a + b, 0)
    console.log(stat1, stat2, stat3)
    res.json({ message: "chapters fetched", chapters, done: true, stat1, stat2, stat3 });
  } catch (error) {
    console.log(error);
  }
});

//get a particular chapter
router.get("/chapter/:chapterId", cors(),async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId).populate(
  [
    {
      path: "workshops",
      select: "workshopName description image dates courseName courseIcon flagshipStatValue2 flagshipStatValue1"
    }, 
    {
      path: 'team',
      select: 'name image designation'
    }])
    const workshops = chapter.workshops
    let stat1, stat2, stat3, hours = [], participants = []
    stat1 = workshops.length
    workshops.map((workshop) => {
      hours.push(workshop.flagshipStatValue2)
      participants.push(workshop.flagshipStatValue1)
    })
    console.log(hours, participants)
    stat2 =  participants.reduce((a, b) => a + b, 0)
    stat3 =  hours.reduce((a, b) => a + b, 0)
    chapter.flagshipStatValue1 = stat1
    chapter.flagshipStatValue2 = stat2
    chapter.flagshipStatValue3 = stat3
    await chapter.save()
    res.status(200).json({ message: "ChapterFetched!", done: true, chapter });
  } catch (error) {
    console.log(error);
  }
});

//create a worksop
router.post("/create-workshop",cors(), async (req, res, next) => {
  console.log(req.body, "hi");
  const {
    workshopName,
    flagshipStatValue1,
    flagshipStatValue2,
    flagshipStatValue3,
    description,
    image,
    carouselImages,
    testimonials,
    project,
    LOR,
    chapterId,
    courseName,
    courseIcon,
    dates,
  } = req.body;
  try {
    console.log(req.body);
    const workshop = await Workshop.create({
      workshopName,
      flagshipStatValue1,
      flagshipStatValue2,
      flagshipStatValue3,
      description,
      image,
      carouselImages,
      testimonials,
      LOR,
      project,
      courseName,
      courseIcon,
      dates,
    });
    const chapter = await Chapter.findById(chapterId);
    // console.log(chapter)
    chapter.workshops.push(workshop._id);
    await chapter.save();
    res
      .status(200)
      .json({ message: "Workshop Created!", done: true, workshop });
  } catch (error) {
    console.log(error);
    next();
  }
});

//get all workshops
router.get("/workshops",cors(), async (req, res) => {
  try {
    const workshops = await Workshop.find({});
    const chapters = await Chapter.find({})
    let stat1 = workshops.length
    let stat2 = chapters.length

    res.status(200).json({ message: "all workshops!", done: true, workshops, stat1, stat2 });
  } catch (error) {
    console.log(error);
  }
});

//get a particular workshop
router.get("/workshop/:workshopId", cors(),async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.workshopId);
    res
      .status(200)
      .json({ message: "Workshop Fetched!", done: true, workshop });
  } catch (error) {
    console.log(error);
  }
});

//create a user
router.post("/create-user",cors(), async (req, res) => {
  const { name, image, department, designation, chapterId } = req.body;
  try {
    const user = await User.create({
      name,
      image,
      department,
      designation,
    });
    if (chapterId) {
      const chapter = await Chapter.findById(chapterId);
      chapter.team.push(user._id);
      await chapter.save();
    }
    res.status(200).json({ message: "User created!", done: true, user });
  } catch (error) {
    console.log(error);
  }
});

//get all users
router.get("/users",cors(), async (req, res) => {
  try {
    
    let org = [], 
    webD = {
      lead: [],
      mems: []
    },
     marketing ={
      lead: [],
      mems: []
    },
     design = {
      lead: [],
      mems: []
    }, 
    socialMedia = {
      lead: [],
      mems: []
    }

    let users = await User.find({dept: true});
    users.map((user) => {
      if(user.department == 'organization'){
        org.push(user.name, user.image)
      }else if(user.department == 'WebD Department'){
        if(user.designation == 'Lead'){
          webD.lead.push([user.image, user.name, user.designation])
        }else{
        webD.mems.push([user.image, user.name])
      }
      }else if(user.department == 'Marketing Department'){
        if(user.designation == 'Lead'){
          marketing.lead.push([user.image, user.name, user.designation])
        }else{
        marketing.mems.push([user.image, user.name])
      }
      }else if(user.department == 'Design Department'){
        if(user.designation == 'Lead'){
          design.lead.push([user.image, user.name, user.designation])
        }else{
        design.mems.push([user.image, user.name])
      }
      } else if(user.department == 'Social Media Department'){
        if(user.designation == 'Lead'){
          socialMedia.lead.push([user.image, user.name, user.designation])
        }else{
        socialMedia.mems.push([user.image, user.name])
      }
    }
    })
    let userData = {
      org, webD, marketing, design, socialMedia
    }

    console.log(userData.design.mems)
    res.status(200).json({ message: "Users fetched", done: true, userData });
  } catch (error) {
    console.log(error);
  }
});

router.post('/chapter-delete', cors(),async (req, res) => {
  try {
    const chapters = await Chapter.find({})
    // for (const chapter of chapters) {
    //   chapter.team = []
    //   chapter.workshops= []
    //   await chapter.save()
    // }
    res.status(200).json({message: 'ok'})
    console.log(chapters)
  } catch (error) {
    console.log(error)
  }
})

router.post("/data",cors(), async (req, res) => {
  try {
    const doc = new GoogleSpreadsheet('18XBWjzeytN39_KQaHYz734qK7XcRjagjI-e5BWGd7JI')
    await doc.useServiceAccountAuth({
      client_email: "krishna@the-girl-code-315413.iam.gserviceaccount.com",
      private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDCOhKgeOiaMblk\nwGjEctSEDWdxzZuNgMvmvanJsIQS0fjp+uENXoqMbLNCh30GHiaY/tOGrtoq1008\nA8E/fY68kL9ioksjHse6lIXobOzNbShvSBpAz3UeIzZB57lzRntPCZ5lyvAPCaWI\nmDDnXh5I2dkESVZWRpffy5SyUbBTPRvYJuB2ON1tm6YmPLbTxJiGRWB6abBkIXb8\ndv0RHcTsh9zUAt8HQfXuzT7m43mySfMtU9XKKizt9bv+lPeyWBtu1P0VynwUNImf\ndY5+H1GGNKgoKKgogHX4Yn26Ulhj62dvYywDMJs2ZCnKK4XsS2q6LrBLr0smnOQy\nnal15mcXAgMBAAECggEAB1MYU7vrjbEVXELTUKFB+W7l+Uk3Nglm5x888XG6MVmA\nyRYgeZgYon4Q7o/ce6gUbY2inYAnkxkGfR5pIcNS6DKPPSGAsuTcxGEIgcDl10No\nFHZEIzCPqqDKUYbzG/FLAiqLMiyKjA6hkvqmUXtfqgCpKfu4CU3lOVfcljL1ctYY\nt4z8i4QAjwi3hMsVeGXV4PDFLTSpK0tIOpBo5ZBbQGQPFtQ+OLjogbQNFSjezzsr\ngA8TKDw1ra/k+jGU8SMeVGB2TBxM71rjL8z8RLlw3j+iBrgKTc5ZTDIN/oN2Yo4K\nU1W1+TlCcuP0z81lSeU07nCG1l5MmrgS65xNMr6qZQKBgQD3VwrtotiB8HfJihL5\nogTbpcacG1qvPYrEy/c+z70kOd6aZ78f7aVFFDFE/oIgtEWxsyalLBRJZGOzxK3R\nVSgZGL4F892/NzGrbzTDqtUS+gPZ8xsAEqR5CTuqFEaHM21qqjCWHLfwFsQgTrS2\nmUDpzNxqZEk2RVy76kQGz0i8AwKBgQDJBvdf5WUCxKJUFuVL7jwBkwBVpVrj8hQG\nx3QlbLMmItvcWwkqkZjVqlWqwApXymI7PRucTzj1ufymzJ55Tz/ph3exGrc7yRcd\nGCcY2g2JUDedBY39qLiavCdF8Wfb9cUBIjWb9285iBiizpD0YEzC8dTcG2HWazOp\nU0FDCnteXQKBgQC8Buqi3oISvdiCWLm2Fin1RF/ouo7E21cL5jaOBGS4DlogLTBJ\nOGLEUeZmmcgYzpKQ1S1SsWC2rl9xANpWYZM7COkkI1B2laHnvoFxIgQbCf81h68F\n7iYkcRVvZTx8eWb7iGepJinalaQBH3QXwAdt9TO2mYhifnZR0HRobNnROwKBgHC5\nLEukqSCFPHUkpY0PWKyVTpG3+CBrpRksDI/TxR00XM7SaXBqViYxrnnh16rkvHJ1\nUJ80uT7o/KhXguGJM9ByewZfcbHfj8truLixxPdjeNveuoErc+CoculAdbmctcxt\n71u2wrKjAxV/+T5fJYwG6RJHdHQ0hrKDEcxS+1ytAoGBAN9P8ixdH7fswpdLn5f8\n64a3Kx5HctCjofWFcOyQ4Ack4z7YT5Hyjln2k7juKuxCr4Fsa+IPZk30w4SMju7Z\nT3s38EInHXEsFTEcLgs0Ls9hKbxQz/XJ/Iya/iAEQlaphmDd6KOTJLpRUL6W5NMG\ncmBHxVeoME4BzU5wdP8IDmdn\n-----END PRIVATE KEY-----\n",
    }, console.log('hi'));
    //console.log(doc, 'doc')
    await doc.loadInfo()
    const sheet = doc.sheetsByIndex[0]
    const rows = await sheet.getRows()
    rows.map(async (row) => {
      const number = parseFloat(row. _rawData[9])
      const arr = row. _rawData[18].split(',')
      try {
        const workshop = await Workshop.create({
          workshopName: row._rawData[0],
          flagshipStatValue1: row._rawData[22],
          flagshipStatValue2: parseFloat(row. _rawData[9]),
          flagshipStatValue3: row._rawData[8],
          description: row._rawData[17],
          image: row._rawData[18].split(',')[0],
          carouselImages: row._rawData[18].split(','),
          LOR: row._rawData[19],
          courseName: row._rawData[4],
          courseIcon: row._rawData[20],
          dates: row._rawData[7]
        });
        const id = row._rawData[21].toString()
        const chapter = await Chapter.findById(id);
        // console.log(chapter)
        chapter.workshops.push(workshop._id);
        await chapter.save();
        console.log(workshop)
      } catch (error) {
        console.log(error)
      }
     
    })
    res.status(200).json({message: 'ok'})
  } catch (error) {
    console.log(error)
  }
})

router.post("/data-chapter-team",cors(), async (req, res) => {
  try {
    const doc = new GoogleSpreadsheet('1QsqRjVLDbKynXBl2xwqwX3Bt1XryjoQjQNHc-n8d8-o')
    await doc.useServiceAccountAuth({
      client_email: "krishna@the-girl-code-315413.iam.gserviceaccount.com",
      private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDCOhKgeOiaMblk\nwGjEctSEDWdxzZuNgMvmvanJsIQS0fjp+uENXoqMbLNCh30GHiaY/tOGrtoq1008\nA8E/fY68kL9ioksjHse6lIXobOzNbShvSBpAz3UeIzZB57lzRntPCZ5lyvAPCaWI\nmDDnXh5I2dkESVZWRpffy5SyUbBTPRvYJuB2ON1tm6YmPLbTxJiGRWB6abBkIXb8\ndv0RHcTsh9zUAt8HQfXuzT7m43mySfMtU9XKKizt9bv+lPeyWBtu1P0VynwUNImf\ndY5+H1GGNKgoKKgogHX4Yn26Ulhj62dvYywDMJs2ZCnKK4XsS2q6LrBLr0smnOQy\nnal15mcXAgMBAAECggEAB1MYU7vrjbEVXELTUKFB+W7l+Uk3Nglm5x888XG6MVmA\nyRYgeZgYon4Q7o/ce6gUbY2inYAnkxkGfR5pIcNS6DKPPSGAsuTcxGEIgcDl10No\nFHZEIzCPqqDKUYbzG/FLAiqLMiyKjA6hkvqmUXtfqgCpKfu4CU3lOVfcljL1ctYY\nt4z8i4QAjwi3hMsVeGXV4PDFLTSpK0tIOpBo5ZBbQGQPFtQ+OLjogbQNFSjezzsr\ngA8TKDw1ra/k+jGU8SMeVGB2TBxM71rjL8z8RLlw3j+iBrgKTc5ZTDIN/oN2Yo4K\nU1W1+TlCcuP0z81lSeU07nCG1l5MmrgS65xNMr6qZQKBgQD3VwrtotiB8HfJihL5\nogTbpcacG1qvPYrEy/c+z70kOd6aZ78f7aVFFDFE/oIgtEWxsyalLBRJZGOzxK3R\nVSgZGL4F892/NzGrbzTDqtUS+gPZ8xsAEqR5CTuqFEaHM21qqjCWHLfwFsQgTrS2\nmUDpzNxqZEk2RVy76kQGz0i8AwKBgQDJBvdf5WUCxKJUFuVL7jwBkwBVpVrj8hQG\nx3QlbLMmItvcWwkqkZjVqlWqwApXymI7PRucTzj1ufymzJ55Tz/ph3exGrc7yRcd\nGCcY2g2JUDedBY39qLiavCdF8Wfb9cUBIjWb9285iBiizpD0YEzC8dTcG2HWazOp\nU0FDCnteXQKBgQC8Buqi3oISvdiCWLm2Fin1RF/ouo7E21cL5jaOBGS4DlogLTBJ\nOGLEUeZmmcgYzpKQ1S1SsWC2rl9xANpWYZM7COkkI1B2laHnvoFxIgQbCf81h68F\n7iYkcRVvZTx8eWb7iGepJinalaQBH3QXwAdt9TO2mYhifnZR0HRobNnROwKBgHC5\nLEukqSCFPHUkpY0PWKyVTpG3+CBrpRksDI/TxR00XM7SaXBqViYxrnnh16rkvHJ1\nUJ80uT7o/KhXguGJM9ByewZfcbHfj8truLixxPdjeNveuoErc+CoculAdbmctcxt\n71u2wrKjAxV/+T5fJYwG6RJHdHQ0hrKDEcxS+1ytAoGBAN9P8ixdH7fswpdLn5f8\n64a3Kx5HctCjofWFcOyQ4Ack4z7YT5Hyjln2k7juKuxCr4Fsa+IPZk30w4SMju7Z\nT3s38EInHXEsFTEcLgs0Ls9hKbxQz/XJ/Iya/iAEQlaphmDd6KOTJLpRUL6W5NMG\ncmBHxVeoME4BzU5wdP8IDmdn\n-----END PRIVATE KEY-----\n",
    }, console.log('hi'));
    //console.log(doc, 'doc')
    await doc.loadInfo()
    const sheet = doc.sheetsByIndex[1]
    const rows = await sheet.getRows()
    //console.log(rows)
    rows.map(async (row) => {
      //console.log(row._rawData)
      try {
        const user = await User.create({
          name: row._rawData[1],
          image: row._rawData[4],
          designation: row._rawData[2],
        });
        const id = row._rawData[5].toString()
        console.log(row._rowNumber, id, typeof id)
        const chapter = await Chapter.findById(id);
        console.log(chapter)
        chapter.team.push(user._id);
        await chapter.save();
        console.log(user)
      } catch (error) {
        console.log(error)
      }
     
    })
    res.status(200).json({message: 'ok'})
  } catch (error) {
    console.log(error)
  }
})

router.post("/data-dept",cors(), async (req, res) => {
  try {
    const doc = new GoogleSpreadsheet('1QsqRjVLDbKynXBl2xwqwX3Bt1XryjoQjQNHc-n8d8-o')
    await doc.useServiceAccountAuth({
      client_email: "krishna@the-girl-code-315413.iam.gserviceaccount.com",
      private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDCOhKgeOiaMblk\nwGjEctSEDWdxzZuNgMvmvanJsIQS0fjp+uENXoqMbLNCh30GHiaY/tOGrtoq1008\nA8E/fY68kL9ioksjHse6lIXobOzNbShvSBpAz3UeIzZB57lzRntPCZ5lyvAPCaWI\nmDDnXh5I2dkESVZWRpffy5SyUbBTPRvYJuB2ON1tm6YmPLbTxJiGRWB6abBkIXb8\ndv0RHcTsh9zUAt8HQfXuzT7m43mySfMtU9XKKizt9bv+lPeyWBtu1P0VynwUNImf\ndY5+H1GGNKgoKKgogHX4Yn26Ulhj62dvYywDMJs2ZCnKK4XsS2q6LrBLr0smnOQy\nnal15mcXAgMBAAECggEAB1MYU7vrjbEVXELTUKFB+W7l+Uk3Nglm5x888XG6MVmA\nyRYgeZgYon4Q7o/ce6gUbY2inYAnkxkGfR5pIcNS6DKPPSGAsuTcxGEIgcDl10No\nFHZEIzCPqqDKUYbzG/FLAiqLMiyKjA6hkvqmUXtfqgCpKfu4CU3lOVfcljL1ctYY\nt4z8i4QAjwi3hMsVeGXV4PDFLTSpK0tIOpBo5ZBbQGQPFtQ+OLjogbQNFSjezzsr\ngA8TKDw1ra/k+jGU8SMeVGB2TBxM71rjL8z8RLlw3j+iBrgKTc5ZTDIN/oN2Yo4K\nU1W1+TlCcuP0z81lSeU07nCG1l5MmrgS65xNMr6qZQKBgQD3VwrtotiB8HfJihL5\nogTbpcacG1qvPYrEy/c+z70kOd6aZ78f7aVFFDFE/oIgtEWxsyalLBRJZGOzxK3R\nVSgZGL4F892/NzGrbzTDqtUS+gPZ8xsAEqR5CTuqFEaHM21qqjCWHLfwFsQgTrS2\nmUDpzNxqZEk2RVy76kQGz0i8AwKBgQDJBvdf5WUCxKJUFuVL7jwBkwBVpVrj8hQG\nx3QlbLMmItvcWwkqkZjVqlWqwApXymI7PRucTzj1ufymzJ55Tz/ph3exGrc7yRcd\nGCcY2g2JUDedBY39qLiavCdF8Wfb9cUBIjWb9285iBiizpD0YEzC8dTcG2HWazOp\nU0FDCnteXQKBgQC8Buqi3oISvdiCWLm2Fin1RF/ouo7E21cL5jaOBGS4DlogLTBJ\nOGLEUeZmmcgYzpKQ1S1SsWC2rl9xANpWYZM7COkkI1B2laHnvoFxIgQbCf81h68F\n7iYkcRVvZTx8eWb7iGepJinalaQBH3QXwAdt9TO2mYhifnZR0HRobNnROwKBgHC5\nLEukqSCFPHUkpY0PWKyVTpG3+CBrpRksDI/TxR00XM7SaXBqViYxrnnh16rkvHJ1\nUJ80uT7o/KhXguGJM9ByewZfcbHfj8truLixxPdjeNveuoErc+CoculAdbmctcxt\n71u2wrKjAxV/+T5fJYwG6RJHdHQ0hrKDEcxS+1ytAoGBAN9P8ixdH7fswpdLn5f8\n64a3Kx5HctCjofWFcOyQ4Ack4z7YT5Hyjln2k7juKuxCr4Fsa+IPZk30w4SMju7Z\nT3s38EInHXEsFTEcLgs0Ls9hKbxQz/XJ/Iya/iAEQlaphmDd6KOTJLpRUL6W5NMG\ncmBHxVeoME4BzU5wdP8IDmdn\n-----END PRIVATE KEY-----\n",
    });
    //console.log(doc, 'doc')
    await doc.loadInfo()
    const sheet = doc.sheetsByIndex[0]
    const rows = await sheet.getRows()
    //console.log(rows)
    rows.map(async (row) => {
      //console.log(row._rawData)
      try {
        const user = await User.create({
          name: row._rawData[1],
          image: row._rawData[4],
          department: row._rawData[0],
          designation: row._rawData[2],
          dept: true
        });
        // const id = row._rawData[21].toString()
        // const chapter = await Chapter.findById(id);
        // // console.log(chapter)
        // chapter.workshops.push(workshop._id);
        // await chapter.save();
        console.log(user)
      } catch (error) {
        console.log(error)
      }
     
    })
    res.status(200).json({message: 'ok'})
  } catch (error) {
    console.log(error)
  }
})

module.exports = router;
