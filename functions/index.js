import  fs  from 'fs';


const createCollectionFile = (folder,value,valueField) => {
    fs.writeFile(`${folder}/${value.toLowerCase().replace(' ','-')}.md`, `${valueField}: ${value}`, (err) => {
        // If there is any error in writing to the file, return
        if (err) {
            console.error(err)
            return
        }

        // Log this message if the file was written to successfully
        console.log('wrote to file successfully')
    })
}
export default createCollectionFile
