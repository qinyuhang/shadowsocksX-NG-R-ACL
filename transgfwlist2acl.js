/*
 * 2017 all rights reserved qinyuhangxiaoxiang@gmail.com
 * this file is help transfor gfwlist.txt to useful acl file
 * about acl see https://github.com/shadowsocks/shadowsocks-libev
 * NOTICE I have see there is lots of wired domain and domain in
 * GFWLIST, I think there is a problem with GFWLIST
 * We should not buy it at all
 * You should try filter useless domian(or poission domain)
 *
 * The default filter will drop all IP in the gfwlist.txt
 * TODO during the transfer the project should check it by send
 * HTTP request to the domain(not the full URL) to check if it is true
 * Also how should the program distinct a site 404 with gfw 404
 *
 */
const fs = require('fs')
const path = require('path')
const http = require('http')
const https = require('https')
function filterNotRule(v){
    return v !== "" &&  v[0] !== "[" && v[0] !== "!" && v[0] !== "@" && !isIP(v)
}
function isIP(v){
    return /(\d{1,3}\.){3}\d{1,3}(:\d+)?/.test(v)
}
function usage(){
    console.error("Usage: ", path.basename(process.argv[0]), path.basename(process.argv[1]), "-i path/to/gfwlist.txt -o path/to/outputACLfile.acl");
}
function reduceList(listArray){
    let ret = Object.create(null)
    listArray.forEach( v => {
        if (!ret[v]){
            ret[v] = true
        }
    })
    return Array.prototype.slice.call(Object.keys(ret))
}
function main() {
    if (process.argv.length < 5) {
        usage();
        return;
    }
    let appArgv = process.argv.slice()
    const argvObj = {
        "-i": "inputFile",
        "-o": "outputFile"
    }
    let argvs = Object.create(null)
    appArgv.forEach( (v, i) => {
        if (argvObj.hasOwnProperty(v)) {
            argvs[argvObj[v]] = appArgv[i+1]
        }
    })
    let str = ""
    fs.readFile( path.resolve(__dirname, argvs["inputFile"]), (err, body) => {
        if (err) { console.error("cannot read file", err);return }
        str = Buffer.from(body.toString(), "base64").toString()
        let arr = str.split("\n")
            .filter( filterNotRule )
            .map( v => {
                while(v[0] === '|' || v[0] === '.'){
                    v = v.slice(1,v.length)
                }
                if (/^http:\/\//.test(v)) {
                    v = v.slice(7,v.lenth);
                }
                if (/^https:\/\//.test(v)) {
                    v = v.slice(8, v.length);
                }
                return "^(.*\.)?" + v.replace(/\./g, "\\.") + "$"
            })
        //console.log(arr)
        let w = fs.createWriteStream(path.resolve(__dirname, argvs["outputFile"]));
        w.write(reduceList(arr).join("\n"))
        // arr.forEach( v => {
        //     console.log(v)
        // })
    })
}
main()
