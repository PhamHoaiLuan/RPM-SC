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
  const bs58 = require('bs58')

  //**Config Web3.js**//

  const web3 = new Web3();
  web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));
  var contractAddress = '0x4182bcef67d8669ee31aeb992b51787b1c139dc3';
  var ABI = JSON.parse('[{"constant":false,"inputs":[{"name":"_DoctorAddress","type":"address"},{"name":"_PatientAddress","type":"address"},{"name":"_HPuK","type":"bytes32"},{"name":"_HI","type":"bytes2"}],"name":"Authorize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_PatientAddress","type":"address"},{"name":"_index1","type":"uint256"},{"name":"_index2","type":"uint256"}],"name":"GetFile","outputs":[{"name":"","type":"bytes32"},{"name":"","type":"bytes32"},{"name":"","type":"bytes2"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_PatientAddress","type":"address"}],"name":"GetindexSDS","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_PatientAddress","type":"address"}],"name":"GetindexMS","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_PatientAddress","type":"address"},{"name":"_index1","type":"uint256"}],"name":"GetTimestamp","outputs":[{"name":"","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_DoctorAddress","type":"address"},{"name":"_index1","type":"uint256"},{"name":"_HKey","type":"bytes32"},{"name":"_HI","type":"bytes2"}],"name":"TransmitKey","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_DoctorAddress","type":"address"},{"name":"_Situation","type":"uint8"}],"name":"Alert","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_PatientAddress","type":"address"},{"name":"_HI","type":"bytes2"},{"name":"_index2","type":"uint256"}],"name":"Modify_HI","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_PatientAddress","type":"address"},{"name":"_index1","type":"uint256"}],"name":"GetDoctor","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_HFile","type":"bytes32"},{"name":"_Timestamp","type":"uint32"},{"name":"_HKey","type":"bytes32"},{"name":"_HI","type":"bytes2"}],"name":"Store","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_PatientAddress","type":"address"},{"name":"_index1","type":"uint256"},{"name":"_index2","type":"uint256"}],"name":"GetPuK","outputs":[{"name":"","type":"bytes32"},{"name":"","type":"bytes2"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_PatientAddress","type":"address"}],"name":"Request","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_PatientAddress","type":"address"},{"name":"_HPuK","type":"bytes32"},{"name":"_index1","type":"uint256"}],"name":"Modify_HPuK","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_PatientAddress","type":"address"}],"name":"UnregisterPatient","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_PatientAddress","type":"address"}],"name":"RegisterPatient","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"Hospital","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_address","type":"address"}],"name":"Patient_Added","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_address","type":"address"}],"name":"Patient_Removed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_PatientAddress","type":"address"},{"indexed":false,"name":"_DoctorAddress","type":"address"}],"name":"Authorized","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_PatientAddress","type":"address"},{"indexed":false,"name":"_index","type":"uint256"}],"name":"HPuK_Modified","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_PatientAddress","type":"address"},{"indexed":false,"name":"_index","type":"uint256"}],"name":"HI_Modified","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_PatientAddress","type":"address"}],"name":"Stored","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_DoctorAddress","type":"address"}],"name":"Transmited","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_DoctorAddress","type":"address"},{"indexed":false,"name":"_PatientAddress","type":"address"},{"indexed":false,"name":"_Situation","type":"uint8"}],"name":"Alerted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_DoctorAddress","type":"address"},{"indexed":false,"name":"_PatientAddress","type":"address"}],"name":"Requested","type":"event"}]');
  web3.eth.defaultAccount = web3.eth.accounts[1]
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
  const Private_Key = new NodeRSA('-----BEGIN RSA PRIVATE KEY-----\n'+
  'MIIEoQIBAAKCAQB1Fl89mUgFO2V2b4wPdJHHqp6vNE4fYbn9RXA8AwoGalTnDgYQ\n'+
  'gIzQ8Fy2/12/v47taw4wUawrgeSatUkAJa36Ki6ZV3m3DvXcWjp+4YMO6KXDrrFM\n'+
  'j7Z5++hfbapctDTH64TN51mciFNSAmDWAwG96M8jM2/3u4VHgyWCgyJ0NM2HWd9m\n'+
  'ITKpFdn8MmjpLPCCKj3ITPHsVqP0VuaHMfRIHPJQuOurvZESF7LwrF7mUXFEGFyy\n'+
  'KuTlp1Dge0LV4mkS0FLnf4ctGlct70chUXKB8GX8owG3X0Gkma+SU9IxGyzuOGw+\n'+
  'HUjdqAuJclsqeqZNcUDNBXqKvrVSCniAOMENAgMBAAECggEAWanPN3HJSFBq656S\n'+
  'aEeBV6DeMhdg+AEzl7N0NlCxfaYx7Fq95Cc9LsfSiETYev1rq35++BujOBIZiSvo\n'+
  'gldYeqmQ09a8G6Y2Ow9RmlaBsYoRXt/JYHLxb0qscV+exa0ueiZupetToV54R+YQ\n'+
  'V/Mng1HkRfWe+dw9PT0+HUrkuI2pmWnUFrzXbzxw038DBYfeKVfEqfznXdRH3ra/\n'+
  '4mXBziMj0h68ShQ8x7YrS41Uch0S6N6IceynyB9cVjHzhxbi0miuz759UJN4Ob9F\n'+
  '9LpHTMAig+rQIvlNEAK50wSX/KGW10peP9Tztarz1Wvk/3WE1/m67sAMenSMYggL\n'+
  'QUDGwQKBgQC1scDfwCkk/1rVFB9BRfR506xms3wU4m0XBdHCFdqcYiFbLlfyrK6X\n'+
  '5qhOWBgn72s8wJrKGBq5Cc57+6k7u7K1NycsGXB55VcLyMmh34mk1GcZy3l1gf75\n'+
  'QJ1uzqe8dxNczIOmeGlqz75yBY4ylgI+X8ekFShJkTINDDnIwS3bcQKBgQCk+K37\n'+
  'M9ir7x0qa0bHVFM9auZL/EmpY10nfVz4M6HOOuiHR4AfNAN5/7M4SnM2NQ5yOZIf\n'+
  'Z8R+22W7aCMZHli5giRfmfyu4y3K5tnL3Fjx54wBPnGELkSudqqAV/LkCEfkvCKw\n'+
  'h/CKRL55UkVW0rgn36HQNvVuAobk4516FUIZXQKBgAaNGTI4IIOn/WNvbU0SM6Vs\n'+
  '32t4j0HFhD9vQ0fnN9GprCA4hI1IcqchdvIUNRLDjC9Nlocw5U3Er8BCq7BurRvh\n'+
  'mDT72dVbUo8nNzXx9GmQCwOgFYoKHOJp1QNYyi1+caFH8ns/HjXutaQw1Ra31+7d\n'+
  'zzn4VVKJvK9BwJefd4LRAoGADINcVwCAv9HcSXpnnPj1c2QnYb4aLEIAL92fbqgj\n'+
  '7sujFZfDzRoZ5WgSxQNIp+TwWpOpVL5/NgwYNFXay630luWbMrEwbGeI8qn9/SuS\n'+
  'h47DnNiKrbcAuKcBmciSAN/r7BqlGvTEtwgt1m/6GHLVSxj4Yh25EgYZC0WEjV0N\n'+
  'bXUCgYByuRUEYt2XHIbiwI4dxD0yOgi+ieMa/TBYdnWlnXnMts40BUzSgQ62stiU\n'+
  'pUaGlp/VfQ++6zgbO17DbLpr3RQAedKjFL64zqaqfpBA4SP/a14BV7ih1GXRLSpi\n'+
  'TPNPN1PD5cxG63EOklxmHFpc++B11RgrkMHcaZmjUSSCxgNzDw==\n'+
  '-----END RSA PRIVATE KEY-----');
  SensorDataFile = fs.createWriteStream("test.txt");

  //--------------------//
  //--Diagnostic Stage--//
  //--------------------//

  RPM.Transmited().watch(function(error, result){
    if (!error)
      {
        RPM.GetindexSDS(web3.eth.accounts[2],function(error, result0) {
          if (!error) {
            console.log('index1: '+parseInt(result0[0]))
            console.log('index2: '+parseInt(result0[1]))
            
            //**GetFile**//         
            RPM.GetFile(web3.eth.accounts[2],parseInt(result0[0]),parseInt(result0[1]),function(error, result1) {
              if (!error) {
                console.log('HOEF: '+result1[0].toString())
                console.log('HOEK: '+result1[1].toString())
                console.log('HI: '+result1[2].toString())   
                var HEF =result1[2].toString('hex').substring(2, result1[0].toString('hex').length)+result1[0].toString('hex').substring(2, result1[0].toString('hex').length);
                var HEK =result1[2].toString('hex').substring(2, result1[0].toString('hex').length)+result1[1].toString('hex').substring(2, result1[1].toString('hex').length);
                const bytes1 = Buffer.from(HEF, 'hex')
                const bytes2 = Buffer.from(HEK, 'hex')
                const address1 = bs58.encode(bytes1)  
                const address2 = bs58.encode(bytes2)     

                //**Download Encrypted File**//
                ipfs.files.get(address1, function (err, files) {
                  files.forEach((file1) => {  
                    var EF = file1.content.toString('utf8');
                    ipfs.files.get(address2, function (err, files) {
                      files.forEach((file2) => {  
                        var EK = file2.content.toString('utf8'); 
                        AES_KEY = Private_Key.decrypt(EK, 'utf8');
                        console.log(AES_KEY)
                        SensorDataFile.write(file1.content, function() {
                          encryptor.decryptFile('test.txt', 'sensor.txt', AES_KEY, options, function(err) {
                            fs.readFile('sensor.txt', 'utf8', function(err, contents) {
                              console.log(contents);
                            });
                        });
                      })  
                    }) 
                  }) 
                  })  
                })              
              } else
                 console.log(error);
            });
          } else
             console.log(error);
        });
      
      }else
        console.log(error);
  });
  
  return app;
}
