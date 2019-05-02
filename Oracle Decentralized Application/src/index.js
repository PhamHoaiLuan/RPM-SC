import RpiLeds from 'rpi-leds';
import Web3 from 'web3';
import ipfs from 'ipfs-api';
//import gpio from 'rpi-gpio';
import gpio from 'gpio';


export default (app) => {

  //**Add Library**//

  var fs = require('fs');
  var crypto = require('crypto');
  var encryptor = require('file-encryptor');
  const ipfsAPI = require('ipfs-api');
  const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})
  var NodeRSA = require('node-rsa');
  var five = require('johnny-five');
  const board = new five.Board({ port: "COM3" });
  const bs58 = require('bs58')

  //**Config Web3.js**//

  const web3 = new Web3();
  web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));
  var contractAddress = '0x4182bcef67d8669ee31aeb992b51787b1c139dc3';
  var ABI = JSON.parse('[{"constant":false,"inputs":[{"name":"_DoctorAddress","type":"address"},{"name":"_PatientAddress","type":"address"},{"name":"_HPuK","type":"bytes32"},{"name":"_HI","type":"bytes2"}],"name":"Authorize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_PatientAddress","type":"address"},{"name":"_index1","type":"uint256"},{"name":"_index2","type":"uint256"}],"name":"GetFile","outputs":[{"name":"","type":"bytes32"},{"name":"","type":"bytes32"},{"name":"","type":"bytes2"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_PatientAddress","type":"address"}],"name":"GetindexSDS","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_PatientAddress","type":"address"}],"name":"GetindexMS","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_PatientAddress","type":"address"},{"name":"_index1","type":"uint256"}],"name":"GetTimestamp","outputs":[{"name":"","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_DoctorAddress","type":"address"},{"name":"_index1","type":"uint256"},{"name":"_HKey","type":"bytes32"},{"name":"_HI","type":"bytes2"}],"name":"TransmitKey","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_DoctorAddress","type":"address"},{"name":"_Situation","type":"uint8"}],"name":"Alert","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_PatientAddress","type":"address"},{"name":"_HI","type":"bytes2"},{"name":"_index2","type":"uint256"}],"name":"Modify_HI","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_PatientAddress","type":"address"},{"name":"_index1","type":"uint256"}],"name":"GetDoctor","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_HFile","type":"bytes32"},{"name":"_Timestamp","type":"uint32"},{"name":"_HKey","type":"bytes32"},{"name":"_HI","type":"bytes2"}],"name":"Store","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_PatientAddress","type":"address"},{"name":"_index1","type":"uint256"},{"name":"_index2","type":"uint256"}],"name":"GetPuK","outputs":[{"name":"","type":"bytes32"},{"name":"","type":"bytes2"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_PatientAddress","type":"address"}],"name":"Request","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_PatientAddress","type":"address"},{"name":"_HPuK","type":"bytes32"},{"name":"_index1","type":"uint256"}],"name":"Modify_HPuK","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_PatientAddress","type":"address"}],"name":"UnregisterPatient","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_PatientAddress","type":"address"}],"name":"RegisterPatient","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"Hospital","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_address","type":"address"}],"name":"Patient_Added","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_address","type":"address"}],"name":"Patient_Removed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_PatientAddress","type":"address"},{"indexed":false,"name":"_DoctorAddress","type":"address"}],"name":"Authorized","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_PatientAddress","type":"address"},{"indexed":false,"name":"_index","type":"uint256"}],"name":"HPuK_Modified","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_PatientAddress","type":"address"},{"indexed":false,"name":"_index","type":"uint256"}],"name":"HI_Modified","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_PatientAddress","type":"address"}],"name":"Stored","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_DoctorAddress","type":"address"}],"name":"Transmited","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_DoctorAddress","type":"address"},{"indexed":false,"name":"_PatientAddress","type":"address"},{"indexed":false,"name":"_Situation","type":"uint8"}],"name":"Alerted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_DoctorAddress","type":"address"},{"indexed":false,"name":"_PatientAddress","type":"address"}],"name":"Requested","type":"event"}]');
  web3.eth.defaultAccount = web3.eth.accounts[2]
  var RPM = web3.eth.contract(ABI).at(contractAddress);
  
  //**Variable**//

  var AES_KEY;
  var options = { algorithm: 'aes256' };
  var Read_File1;
  var Read_File2;
  var Buffer_File1;
  var Buffer_File2;
  var Buffer_File3;
  var SensorDataFile;
  var EncryptedKeyFile;
  var File_Name_Temp;
  var Hash_File;
  var Hash_Key;
  var HI;
  var HO_Hash_File;
  var HO_Hash_Key;
  var HO_Hash_New_Key;
  const Public_Key = new NodeRSA('-----BEGIN PUBLIC KEY-----\n'+
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmYT6R2BTtPc26yjw5UJt\n'+
  '8P+gVK21PHl0bu/B457zyjP87mgYiBbK2sAuXluVapxkERKiRswVOZLzZvrhNd8F\n'+
  'GmZZa7/j61cI3qLUrUGzBgdy2wXWiNQBBKqr4YbPNwOEpXBM8h4iPXmOrT9RZVMu\n'+
  'dpldDGWJbLigDeI8/6+MRppUZxbwQ3NmKk9kdjvWBFjIDB8v3xJvk0qTVz2PxfPP\n'+
  'FdmFm8FeORDE+PnhCRGwiRmpK6DaRGZzSzAzf7mmhH8DjdUyU6Kkw8Z0vCzdfyhJ\n'+
  'OfpMu2trJ0DwFjhMXpUaFHnLtkJO1ANmzWuB7q7SWCVvBVZOM/6LURiqVW25Ir6k\n'+
  'bwIDAQAB\n'+
  '-----END PUBLIC KEY-----');
  const Private_Key = new NodeRSA('-----BEGIN RSA PRIVATE KEY-----\n'+
  'MIIEpQIBAAKCAQEAmYT6R2BTtPc26yjw5UJt8P+gVK21PHl0bu/B457zyjP87mgY\n'+
  'iBbK2sAuXluVapxkERKiRswVOZLzZvrhNd8FGmZZa7/j61cI3qLUrUGzBgdy2wXW\n'+
  'iNQBBKqr4YbPNwOEpXBM8h4iPXmOrT9RZVMudpldDGWJbLigDeI8/6+MRppUZxbw\n'+
  'Q3NmKk9kdjvWBFjIDB8v3xJvk0qTVz2PxfPPFdmFm8FeORDE+PnhCRGwiRmpK6Da\n'+
  'RGZzSzAzf7mmhH8DjdUyU6Kkw8Z0vCzdfyhJOfpMu2trJ0DwFjhMXpUaFHnLtkJO\n'+
  '1ANmzWuB7q7SWCVvBVZOM/6LURiqVW25Ir6kbwIDAQABAoIBAB+a1LulBRaYXmID\n'+
  'R7Sq/F9FAQjtygXtKx87lLr7mkzibwvVulcp+hEWx3T9fcE4+RDauTXCBgyYSCvH\n'+
  'Ml4Yz8Ajmf0owA9PF7Bd7VLN18FB/08/4G7C1oLTcBc53acBvmkguXaO5ZWqVMkt\n'+
  '49/sRAB+ij1nGeecCrdRACXTShmuki14bSGBgnbEjop0HmeMnG27ytp4xr2ZKOiY\n'+
  'bOuGMm+YX8L6pNuqdWc3TbXZyZO7Toxw+E33Kh9w8fqzb5SPWjLJ8IbQXhv3R3dW\n'+
  '5zq+EKFpr7aagkpoeeuADIcxHR6o9CczFpYci2HOmJNfv7wopYL+JYTv61j2+coI\n'+
  '0cEEAkECgYEA04kP8vG8wu5dhgu6h8l9GV9IMHrvt+JplhzKfr32sX7cdgwJCDPa\n'+
  'pqYmaurtx3HvbnAx9eNljKCsAN81VJFd0YtuHLKnaxu9tP+r8k2tvP+oOJo0k6pJ\n'+
  'bkMpXtMMwVPE3xt2N8a/oCqC60vZplzqTuSgIe46ClZGoHEWFQKiXKcCgYEAucoE\n'+
  'XBPiIIjYzEuj+WIw/aOm8Zxh1zgNkaYymfM1soqQY4P8fpTSN8sIfuZdmltNtLQB\n'+
  'IZJsJD6vR7upPRQDZDZjrp9e3DiXXrDFQMYPZLIKttjXpnD/nzJsWzr5lC8sVRyY\n'+
  'XtPTzL1Ieg+9DbNGBd/TiQkstGvJaPi1h42sCvkCgYEAyx+7G+t6+afQUI5koE0f\n'+
  'fkSbWkpCdE3KW+XroEajY49Q/V3TMngwhoPXMiXDDBhg9KhxoQ6pjZ8fa3rqh/lK\n'+
  'oJOFubLnxpcN1IcJwpNKuMi57RhOUllbR7DgQfjhL6dTzXVeUHLdwVvw+SaNqg1g\n'+
  'xT8OcWaDfzeXfCr7LFOqOtMCgYEAs/Ux895ukgT7uicqVUz/Fy+FbVKEkusAeav6\n'+
  'J5Sk1qPQ6BPYZuPQG6rWN9T7pZ/6zKXu0o35ocH2Fg14CGlyP4dPVr2YLMfEFzwy\n'+
  'VGOEVYz/Q80WVWnusE0vF88wIJDw6CAilvenmBFgOps0DCkyEk6Tn5D7dGdTWBJQ\n'+
  'A1T+6EECgYEAvnwPE9igCI+qvZyvVDa7hCLfl7IuYzoRjsuyxbfcgsW7JvJxYz16\n'+
  'NFYQgCv7IE4AD4WB0chA9DOvIgMIekaIde+aADyCQV38E7E226/ZLn68nd+iiXit\n'+
  'GSVEKPNjBvj+CbOvFXYvIrVcq8Iuxg2myaZKqYG+DhaPWP31do2grGk=\n'+
  '-----END RSA PRIVATE KEY-----');
  var turnon=0;
  var arr = new Array();
  var today = new Date();
  var Timetemp = today.getTime();
  var File_Name = Timetemp;
  var AOE_Doctor;


  // var Read_File = fs.readFileSync("PUK_Doctor.txt");              
  // var Buffer_File = new Buffer.alloc(Read_File);
  // console.log(Buffer_File)
  // ipfs.files.add(Buffer_File, function (err, file5) {
  //   if (err) {
  //     console.log(err);
  //   }
  //   console.log('%%%%%Encrypted AES Key: ', file5[0].hash);
  // })

  // ipfs.files.get("QmYCnnGiHrMZd1HH51Vhazam4GGWo5342vguRzLNAGYvnP", function (err, files) {
  //   files.forEach((file) => {             
  //   var test= file.content.toString('utf8');
  //   console.log('$$$$$: '+test)
  //   })
  // })
  //-----------------//
  //--Storage Stage--//
  //-----------------//

  //**Get EOA Doctor**//
  RPM.GetDoctor(web3.eth.accounts[2],1,function(error, result0) {
    if (!error) {
      AOE_Doctor = result0;
      
    } else
    console.log(error);
    });

  //**Raw Data**//
  board.on("ready", () => {
    turnon = 1; 
    var sensor = new five.Sensor.Digital(2);
    var counter=0;
    SensorDataFile = fs.createWriteStream("./File_Data/"+File_Name+".txt");
    sensor.on("change", () => { 
      if(sensor.value){
          counter++;
          var today = new Date();
          var Timestamp = today.getTime();
          var t = Timestamp - Timetemp;
          Timetemp = Timestamp;
          var HeartBeat = (60*1000/t).toFixed(0);
          arr[counter] = HeartBeat; 
          if(counter == 10){
            counter = 0;
            var BM = ((parseInt(arr[1])+parseInt(arr[2])+parseInt(arr[3])+parseInt(arr[4])+parseInt(arr[5])+parseInt(arr[6])+parseInt(arr[7])+parseInt(arr[8])+parseInt(arr[9])+parseInt(arr[10]))/10).toFixed(0);          
            
            //**WriteFile**//
            console.log(Timestamp + "  " +BM)
            SensorDataFile.write(Timestamp + "  " +BM+"\r\n");

            //**Analyze**//
            if(BM<60||BM>100){
              RPM.Alert(AOE_Doctor,2,{from: web3.eth.accounts[2], gas:3000000});
              console.log("Alerted!")
            }
          }
        }
    });
  });
  
  //**Trigger**//
  RPM.Requested().watch(function(error, result){
    if (!error)
        {
          if(turnon==1){ 
            File_Name_Temp = File_Name;
            EncryptedKeyFile = fs.createWriteStream("./File_Key/"+File_Name+".txt");
            today = new Date();
            Timetemp = today.getTime();
            File_Name=Timetemp;
            SensorDataFile = fs.createWriteStream("./File_Data/"+File_Name+".txt");
            
            //**Create A Symmetric Key**//
            AES_KEY = crypto.randomBytes(64).toString('base64'); // 256-bits === 32-bytes
            console.log('AES Key: '+AES_KEY );   
            
            //**Encrypt A Symmetric Key**//
            const EncryptedKey = Public_Key.encrypt(AES_KEY, 'base64');
            console.log('Encrypted AES Key: ', EncryptedKey);
            EncryptedKeyFile.write(EncryptedKey);

            console.log('---------Store into Blockchain---------');

            //**File Encryption**//      
            encryptor.encryptFile("./File_Data/"+File_Name_Temp+".txt", "./File_Cipher_Data/"+"Cipher"+File_Name_Temp+".txt", AES_KEY, options, function(err) { 
              Read_File1 = fs.readFileSync("./File_Cipher_Data/"+"Cipher"+File_Name_Temp+".txt");              
              Buffer_File1 = new Buffer(Read_File1);
              Read_File2 = fs.readFileSync("./File_Key/"+File_Name_Temp+".txt"); 
              Buffer_File2 = new Buffer(Read_File2);

              //**Upload An Encrypted File into IPFS**// 
              ipfs.files.add(Buffer_File1, function (err, file1) {
                if (err) {
                  console.log(err);
                }
                  console.log('Original Hash Encrypted File: '+file1[0].hash)
                  Hash_File = bs58.decode(file1[0].hash);
                  console.log('Decoded Hash Encrypted File: '+Hash_File.toString('hex'))
                  HI = "0x"+Hash_File.toString('hex').substring(0, 4);
                  HO_Hash_File = "0x"+Hash_File.toString('hex').substring(4, Hash_File.toString('hex').length);
                  console.log('HI: '+HI)
                  console.log('HOEF: '+HO_Hash_File)

                  //**Upload An Encrypted Symmetric Key into IPFS**//
                  ipfs.files.add(Buffer_File2, function (err, file2) {
                    if (err) {
                      console.log(err);
                    }
                      console.log('Original Hash Encrypted Key: '+file2[0].hash)
                      Hash_Key = bs58.decode(file2[0].hash);
                      console.log('Decoded Hash Encrypted Key: '+Hash_Key.toString('hex'))
                      HO_Hash_Key = "0x"+Hash_Key.toString('hex').substring(4, Hash_Key.toString('hex').length);
                      console.log('HOEK: '+HO_Hash_Key)

                      //**Store**//
                      RPM.Store(HO_Hash_File,parseInt(File_Name_Temp),HO_Hash_Key,HI,{from: web3.eth.accounts[2], gas:3000000});              
                    })
                })
              })
              

              
        //   //}
         }
         } else {

             console.log(error);
         }
  });

  //----------------------//
  //--Transmit Key Stage--//
  //----------------------//

  RPM.Stored().watch(function(error, result){
    if (!error)
      {
        //**GetPuK**//
        if(turnon==1){
        RPM.GetPuK(web3.eth.accounts[2],1,1,function(error, result1) {
        if (!error) {
            var PuK_Doctor =result1[1].toString('hex').substring(2, result1[0].toString('hex').length)+result1[0].toString('hex').substring(2, result1[0].toString('hex').length);
            const bytes = Buffer.from(PuK_Doctor, 'hex')
            const address2 = bs58.encode(bytes)
                            
            //**Download A Public Key in IPFS**//
            ipfs.files.get(address2.toString(), function (err, files) {
                files.forEach((file) => {             
                var Public_Key_Doctor= file.content.toString('utf8');
                console.log('***A New Encrypted AES KEY: ', Public_Key_Doctor);

                //**Asymmetric Encryption**//
                var key = new NodeRSA();
                key.importKey(Public_Key_Doctor, 'pkcs8-public');
                const EncryptedNewKey = key.encrypt(AES_KEY, 'base64');
                console.log('A New Encrypted AES KEY: ', EncryptedNewKey);
                Buffer_File3 = new Buffer(EncryptedNewKey);

                //**Upload A New Encrypted Symmetric Key into IPFS**//
                ipfs.files.add(Buffer_File3, function (err, file3) {
                    if (err) {
                        console.log(err);
                    }

                    RPM.GetDoctor(web3.eth.accounts[2],1,function(error, result2) {
                      if (!error) {
                        RPM.GetindexSDS(web3.eth.accounts[2],function(error, result3) {
                            if (!error) {

                              console.log('Original Hash Encrypted New Key: '+file3[0].hash)
                              var Hash_New_Key = bs58.decode(file3[0].hash);
                              console.log('Decoded Hash Encrypted New Key: '+Hash_New_Key.toString('hex'))
                              HI = "0x"+Hash_New_Key.toString('hex').substring(0, 4);
                              HO_Hash_New_Key = "0x"+Hash_New_Key.toString('hex').substring(4, Hash_New_Key.toString('hex').length);
                              console.log('HI: '+HI)
                              console.log('HOENK: '+HO_Hash_New_Key)
                              console.log('index1: '+parseInt(result3[0]))
                              console.log('index2: '+parseInt(result3[1]))
                              console.log(HI)
                              console.log(result2)
                              //**Transmit Key**//         
                              RPM.TransmitKey(result2,parseInt(result3[0]),HO_Hash_New_Key,HI,{from: web3.eth.accounts[2], gas:3000000});
                            } else
                               onsole.log(error);
                          });
                        } else
                              console.log(error);
                        });
                  })
             });
                            })
          } else
            console.log(error);
          });
        }        
      }else
        console.log(error);
  });
    
  return app;
}
