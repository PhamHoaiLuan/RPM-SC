
pragma solidity ^0.4.18;

contract RPM_SC{

    address public Hospital;

    modifier onlyHospital() {
        require(msg.sender == Hospital);
        _;
    }

    function RPM_SC() public {
        Hospital = msg.sender;
    }

    //******************************************************//
    //******************************************************//
    //                                                      //
    //       Management Structure Smart Contract            //
    //                                                      //
    //******************************************************//
    //******************************************************//

    event Patient_Added(address _address);
    event Patient_Removed(address _address);
    event Authorized(address _PatientAddress, address _DoctorAddress);
    event HPuK_Modified(address _PatientAddress, uint _index);
    event HI_Modified(address _PatientAddress, uint _index);
    
    struct Management {
        bool Valid;
        uint index1;
        uint index2;
        mapping (uint=>bytes32) HPuK ;
        mapping (uint=>address) Doctor;
        mapping (uint=>bytes2)  HI;
        mapping (address=>bool) Doctor_Valid;
    }
    
    mapping (address => Management) patients;

    function RegisterPatient(address _PatientAddress) onlyHospital public {
        var patient   = patients[_PatientAddress];
        patient.Valid = true;
        Patient_Added(_PatientAddress);
    }

    function UnregisterPatient(address _PatientAddress) onlyHospital public {
        var patient   = patients[_PatientAddress];
        patient.Valid = false;
        Patient_Removed(_PatientAddress);
    }

    function Authorize(address _DoctorAddress,address _PatientAddress,bytes32 _HPuK, bytes2 _HI) onlyHospital public{
        
        var patient   = patients[_PatientAddress];
        patient.index1 = patient.index1 +1;
        patient.HPuK[patient.index1] = _HPuK;
        patient.Doctor[patient.index1] = _DoctorAddress;
        patient.Doctor_Valid[_DoctorAddress] = true;
        
        if(patient.HI[patient.index2] != _HI){
          patient.index2 = patient.index2 + 1;
          patient.HI[patient.index2] = _HI;
        }
        
        Authorized(_DoctorAddress,_PatientAddress);
    }
    
    function Modify_HPuK(address _PatientAddress,bytes32 _HPuK, uint _index1) onlyHospital public{
        var patient   = patients[_PatientAddress];
        patient.HPuK[_index1] = _HPuK;
        HPuK_Modified(_PatientAddress,_index1);
    }
    
     function Modify_HI(address _PatientAddress,bytes2 _HI, uint _index2) onlyHospital public{
        var patient   = patients[_PatientAddress];
        patient.HI[_index2] = _HI;
        HI_Modified(_PatientAddress,_index2);
    }
    
    
    function GetindexMS(address _PatientAddress) view public returns (uint,uint) {
        return (patients[_PatientAddress].index1, patients[_PatientAddress].index2);
    }
    
    function GetDoctor(address _PatientAddress, uint _index1) view public returns (address){
        return patients[_PatientAddress].Doctor[_index1];
    }

    function GetPuK(address _PatientAddress, uint _index1, uint _index2) view public returns (bytes32,bytes2){
        return (patients[_PatientAddress].HPuK[_index1],patients[_PatientAddress].HI[_index2]);
    }


    //******************************************************//
    //******************************************************//
    //                                                      //
    //          Storage Structure Smart Contract            //
    //                                                      //
    //******************************************************//
    //******************************************************//

    event Stored(address _PatientAddress);
    event Transmited(address _DoctorAddress);
    
    modifier onlyPatient() {
        require(patients[msg.sender].Valid == true);
        _;
    }
    
    
    struct Data {
        uint index1;
        uint index2;
        mapping (uint=> bytes2) HI;
        mapping (uint => bytes32) HFile;
        mapping (uint => uint32) Time;
        mapping (uint => mapping(address =>bytes32)) HKey;
    }
    
    
    mapping (address => Data) data;
    
    function Store(bytes32 _HFile, uint32 _Timestamp, bytes32 _HKey,bytes2 _HI) onlyPatient public{
        data[msg.sender].index1                            = data[msg.sender].index1 + 1;
        data[msg.sender].HFile[data[msg.sender].index1]    =  _HFile;
        data[msg.sender].Time[data[msg.sender].index1]     =  _Timestamp;
        data[msg.sender].HKey[data[msg.sender].index1][msg.sender] = _HKey;
        if(data[msg.sender].HI[data[msg.sender].index2] != _HI){
          data[msg.sender].index2 = data[msg.sender].index2 + 1;
          data[msg.sender].HI[data[msg.sender].index2] = _HI;
        }
        
        Stored(msg.sender);
    }
    
    function TransmitKey(address _DoctorAddress, uint _index1, bytes32 _HKey, bytes2 _HI) onlyPatient public{
        
        data[msg.sender].HKey[_index1][_DoctorAddress] = _HKey;
        if(data[msg.sender].HI[data[msg.sender].index2] != _HI){
          data[msg.sender].index2 = data[msg.sender].index2 + 1;
          data[msg.sender].HI[data[msg.sender].index2] = _HI;
        }
        
        Transmited(_DoctorAddress);
    }
    
    function GetTimestamp(address _PatientAddress, uint _index1) view public returns(uint32){
        return (data[_PatientAddress].Time[_index1]);
    }
    
    function GetindexSDS(address _PatientAddress) view public returns (uint,uint) {
        return (data[_PatientAddress].index1, data[_PatientAddress].index2);
    }
    
    function GetFile(address _PatientAddress, uint _index1, uint _index2) view public returns(bytes32,bytes32, bytes2){
        return (data[_PatientAddress].HFile[_index1], data[_PatientAddress].HKey[_index1][msg.sender], data[_PatientAddress].HI[_index2]);
    }
    
    
    //******************************************************//
    
    //******************************************************//
    //                                                      //
    //              Communication Smart Contract            //
    //                                                      //
    //******************************************************//
    //******************************************************//
    
    event Alerted(address _DoctorAddress, address _PatientAddress, uint8 _Situation);
    event Requested(address _DoctorAddress, address _PatientAddress);
    
    function Alert(address _DoctorAddress, uint8 _Situation) public{
        require(patients[msg.sender].Doctor_Valid[_DoctorAddress]==true);
        Alerted(_DoctorAddress,msg.sender,_Situation);
    }

    function Request(address _PatientAddress) public{
        require(patients[_PatientAddress].Doctor_Valid[msg.sender]==true);
        Requested(msg.sender,_PatientAddress);
    }
    
}

