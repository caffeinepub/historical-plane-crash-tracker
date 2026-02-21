import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Text "mo:core/Text";
import Storage "blob-storage/Storage";

module {
  type VerificationStatus = {
    #verified;
    #unverified;
    #fantasy;
  };

  type InvestigationEntry = {
    id : Nat;
    timestamp : Int;
    title : Text;
    description : Text;
    mediaUrls : [Text];
    photos : [Storage.ExternalBlob];
    author : Text;
    tags : [Text];
  };

  type ComplexInvestigationEntry = {
    id : Nat;
    timestamp : Int;
    versionHistory : [InvestigationEntry];
    linkedEntries : [Nat];
    approvedBy : Text;
    status : ?Text;
    photos : [Storage.ExternalBlob];
    videos : [Text];
    documents : [Text];
  };

  type Coordinate = {
    latitude : Float;
    longitude : Float;
  };

  type Aircraft = {
    manufacturer : Text;
    model : Text;
    year : ?Nat;
    registrationNumber : Text;
    ICAOType : Text;
    aircraftType : Text;
  };

  type CasualtyData = {
    totalAboard : Nat;
    fatalities : Nat;
    survivors : Nat;
    crewFatalities : Nat;
    passengerFatalities : Nat;
  };

  type FlightPathPoint = {
    coordinate : Coordinate;
    altitude : ?Float;
    speed : ?Float;
    known : Bool;
  };

  type OldCrashRecord = {
    id : Nat;
    crashDate : Int;
    location : Coordinate;
    airline : Text;
    flightNumber : Text;
    aircraft : Aircraft;
    phaseOfFlight : Text;
    casualties : CasualtyData;
    crashCause : Text;
    source : Text;
    investigationTimeline : [InvestigationEntry];
    flightPath : [FlightPathPoint];
    status : ?Text;
    submittingOrganization : ?Text;
    lastUpdated : Int;
    incidentPhotos : [Storage.ExternalBlob];
    externalReferences : [Text];
    verificationStatus : VerificationStatus;
    sourceVerification : Bool;
  };

  type InvolvedAircraft = {
    aircraft : Aircraft;
    airline : Text;
    casualties : CasualtyData;
    registrationNumber : Text;
  };

  type NewCrashRecord = {
    id : Nat;
    crashDate : Int;
    location : Coordinate;
    airline : Text;
    flightNumber : Text;
    aircraft : Aircraft;
    phaseOfFlight : Text;
    casualties : CasualtyData;
    crashCause : Text;
    source : Text;
    investigationTimeline : [InvestigationEntry];
    flightPath : [FlightPathPoint];
    status : ?Text;
    submittingOrganization : ?Text;
    lastUpdated : Int;
    incidentPhotos : [Storage.ExternalBlob];
    externalReferences : [Text];
    verificationStatus : VerificationStatus;
    sourceVerification : Bool;
    isDisasterCrash : Bool;
    involvedAircraft : [InvolvedAircraft];
  };

  type OldActor = {
    crashRecords : Map.Map<Nat, OldCrashRecord>;
    investigationTimelines : Map.Map<Nat, List.List<InvestigationEntry>>;
    nextEntryId : Nat;
    nextCrashId : Nat;
  };

  type NewActor = {
    crashRecords : Map.Map<Nat, NewCrashRecord>;
    investigationTimelines : Map.Map<Nat, List.List<InvestigationEntry>>;
    nextEntryId : Nat;
    nextCrashId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newCrashRecords = old.crashRecords.map<Nat, OldCrashRecord, NewCrashRecord>(
      func(_id, oldCrashRecord) {
        { oldCrashRecord with isDisasterCrash = false; involvedAircraft = [] };
      }
    );
    {
      old with
      crashRecords = newCrashRecords;
    };
  };
};
