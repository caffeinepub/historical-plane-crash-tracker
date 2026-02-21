import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Migration "migration";

// Specify migration function in with-clause
(with migration = Migration.run)
actor {
  include MixinStorage();

  type Coordinate = {
    latitude : Float;
    longitude : Float;
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

  type FlightPathPoint = {
    coordinate : Coordinate;
    altitude : ?Float;
    speed : ?Float;
    known : Bool;
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

  type VerificationStatus = {
    #verified;
    #unverified;
    #fantasy;
  };

  type InvolvedAircraft = {
    aircraft : Aircraft;
    airline : Text;
    casualties : CasualtyData;
    registrationNumber : Text;
  };

  type CrashRecord = {
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

  let crashRecords = Map.empty<Nat, CrashRecord>();
  var nextCrashId = 0;

  module CrashRecord {
    public func compareByDate(crashRecord1 : CrashRecord, crashRecord2 : CrashRecord) : Order.Order {
      Int.compare(crashRecord1.crashDate, crashRecord2.crashDate);
    };

    public func compareBySurvivors(crashRecord1 : CrashRecord, crashRecord2 : CrashRecord) : Order.Order {
      Nat.compare(crashRecord1.casualties.survivors, crashRecord2.casualties.survivors);
    };
  };

  public query ({ caller }) func getCrashRecords(includeFantasy : ?Bool, includeDisasterCrashes : ?Bool) : async [CrashRecord] {
    let includeGenre = switch (includeFantasy) {
      case (null) { true };
      case (?value) { value };
    };

    let includeDisasters = switch (includeDisasterCrashes) {
      case (null) { false };
      case (?value) { value };
    };

    crashRecords.values().toArray().filter(
      func(record) {
        let genreCheck = includeGenre or record.verificationStatus != #fantasy;
        let disasterCheck = includeDisasters or not record.isDisasterCrash;
        genreCheck and disasterCheck;
      }
    );
  };

  func validatePlaneRegistration(registration : Text) : VerificationStatus {
    let knownRegistrations : [Text] = [
      "N12345",
      "D-ABCD",
      "VH-XYZ",
      "G-ABCD",
      "PT-XYZ",
      "N45678",
      "SE-XYZ",
      "N8082",
    ];

    let isReal = knownRegistrations.find(
      func(r) { Text.equal(r, registration) }
    );

    switch (isReal) {
      case (null) { #unverified };
      case (?_) { #verified };
    };
  };

  func validateDataSource(url : Text) : Bool {
    let patterns : [Text] = [
      "http://",
      "https://",
      ".gov",
      "ntsb.gov",
      "aviation-safety.net",
    ];

    let hasValidUrl = patterns.find(
      func(pattern) {
        let containsPattern = url.contains(#text pattern);
        containsPattern;
      }
    );
    switch (hasValidUrl) {
      case (null) { false };
      case (?_) { true };
    };
  };

  public shared ({ caller }) func addCrashRecord(
    crashDate : Int,
    location : Coordinate,
    airline : Text,
    flightNumber : Text,
    aircraft : Aircraft,
    phaseOfFlight : Text,
    casualties : CasualtyData,
    crashCause : Text,
    source : Text,
    investigationTimeline : [InvestigationEntry],
    flightPath : [FlightPathPoint],
    isFantasyData : ?Bool,
    isDisasterCrash : Bool,
    involvedAircraft : [InvolvedAircraft],
  ) : async Nat {
    let id = nextCrashId;
    nextCrashId += 1;

    if (isDisasterCrash and not validateDataSource(source)) {
      Runtime.trap("Multiple aircraft incidents require verifiable sources. Please provide a credible source for disaster crashes.");
    };

    let fantasyFlag = switch (isFantasyData) {
      case (null) { false };
      case (?value) { value };
    };

    let verificationStatus = if (fantasyFlag) {
      #fantasy;
    } else {
      validatePlaneRegistration(aircraft.registrationNumber);
    };

    let newCrashRecord : CrashRecord = {
      id;
      crashDate;
      location;
      airline;
      flightNumber;
      aircraft;
      phaseOfFlight;
      casualties;
      crashCause;
      source;
      investigationTimeline;
      flightPath;
      status = null;
      submittingOrganization = null;
      lastUpdated = Time.now();
      incidentPhotos = [];
      externalReferences = [];
      verificationStatus;
      sourceVerification = validateDataSource(source);
      isDisasterCrash;
      involvedAircraft;
    };

    crashRecords.add(id, newCrashRecord);
    id;
  };

  public shared ({ caller }) func attachPhotoToCrashRecord(crashId : Nat, photo : Storage.ExternalBlob) : async () {
    switch (crashRecords.get(crashId)) {
      case (null) { Runtime.trap("Crash record not found") };
      case (?record) {
        let updatedPhotos = record.incidentPhotos.concat([photo]);
        let updatedRecord = {
          id = record.id;
          crashDate = record.crashDate;
          location = record.location;
          airline = record.airline;
          flightNumber = record.flightNumber;
          aircraft = record.aircraft;
          phaseOfFlight = record.phaseOfFlight;
          casualties = record.casualties;
          crashCause = record.crashCause;
          source = record.source;
          investigationTimeline = record.investigationTimeline;
          flightPath = record.flightPath;
          status = record.status;
          submittingOrganization = record.submittingOrganization;
          lastUpdated = Time.now();
          incidentPhotos = updatedPhotos;
          externalReferences = record.externalReferences;
          verificationStatus = record.verificationStatus;
          sourceVerification = record.sourceVerification;
          isDisasterCrash = record.isDisasterCrash;
          involvedAircraft = record.involvedAircraft;
        };
        crashRecords.add(crashId, updatedRecord);
      };
    };
  };

  public query ({ caller }) func getCrashRecord(id : Nat) : async CrashRecord {
    switch (crashRecords.get(id)) {
      case (null) { Runtime.trap("Crash record not found") };
      case (?record) { record };
    };
  };

  public query ({ caller }) func getAllCrashRecordsSorted() : async [CrashRecord] {
    let records = crashRecords.values().toArray();
    records.sort(CrashRecord.compareByDate);
  };

  public query ({ caller }) func getSurvivorStories() : async [CrashRecord] {
    let survivorRecords = crashRecords.values().toArray().filter(
      func(record) { record.casualties.survivors > 0 }
    );
    survivorRecords.sort(CrashRecord.compareBySurvivors);
  };

  public query ({ caller }) func getCompleteFlightPath(id : Nat) : async ?[FlightPathPoint] {
    switch (crashRecords.get(id)) {
      case (null) { null };
      case (?record) {
        if (record.flightPath.size() > 0) { ?record.flightPath } else { ?[] };
      };
    };
  };

  public shared ({ caller }) func updateCrashRecord(
    id : Nat,
    crashDate : Int,
    location : Coordinate,
    airline : Text,
    flightNumber : Text,
    aircraft : Aircraft,
    phaseOfFlight : Text,
    casualties : CasualtyData,
    crashCause : Text,
    source : Text,
    investigationTimeline : [InvestigationEntry],
    flightPath : [FlightPathPoint],
    isDisasterCrash : Bool,
    involvedAircraft : [InvolvedAircraft],
  ) : async () {
    switch (crashRecords.get(id)) {
      case (null) { Runtime.trap("Crash record not found") };
      case (?_) {
        let updatedCrashRecord : CrashRecord = {
          id;
          crashDate;
          location;
          airline;
          flightNumber;
          aircraft;
          phaseOfFlight;
          casualties;
          crashCause;
          source;
          investigationTimeline;
          flightPath;
          status = null;
          submittingOrganization = null;
          lastUpdated = Time.now();
          incidentPhotos = [];
          externalReferences = [];
          verificationStatus = #unverified;
          sourceVerification = false;
          isDisasterCrash;
          involvedAircraft;
        };
        crashRecords.add(id, updatedCrashRecord);
      };
    };
  };

  public query ({ caller }) func getCrashRecordsByDateRange(startTimestamp : Int, endTimestamp : Int) : async [CrashRecord] {
    crashRecords.values().toArray().filter(
      func(record) {
        record.crashDate >= startTimestamp and record.crashDate <= endTimestamp
      }
    );
  };

  public query ({ caller }) func getCrashRecordsByPhase(phase : Text) : async [CrashRecord] {
    crashRecords.values().toArray().filter(
      func(record) { Text.equal(record.phaseOfFlight, phase) }
    );
  };

  public query ({ caller }) func searchCrashRecordsByKeyword(keyword : Text) : async [CrashRecord] {
    crashRecords.values().toArray().filter(
      func(record) {
        Text.equal(record.airline, keyword) or
        Text.equal(record.flightNumber, keyword) or
        Text.equal(record.aircraft.model, keyword)
      }
    );
  };

  let investigationTimelines = Map.empty<Nat, List.List<InvestigationEntry>>();
  var nextEntryId = 0;

  public shared ({ caller }) func addInvestigationEntry(
    crashId : Nat,
    timestamp : Int,
    description : Text,
    author : Text,
    mediaUrls : [Text],
  ) : async Nat {
    let id = nextEntryId;
    nextEntryId += 1;

    let newEntry : InvestigationEntry = {
      id;
      timestamp;
      title = "";
      description;
      mediaUrls;
      photos = [];
      author;
      tags = [];
    };

    switch (investigationTimelines.get(crashId)) {
      case (null) {
        let newTimeline = List.empty<InvestigationEntry>();
        newTimeline.add(newEntry);
        investigationTimelines.add(crashId, newTimeline);
      };
      case (?timeline) {
        timeline.add(newEntry);
      };
    };

    id;
  };

  public shared ({ caller }) func attachPhotoToEntry(crashId : Nat, entryId : Nat, photo : Storage.ExternalBlob) : async () {
    switch (investigationTimelines.get(crashId)) {
      case (null) { Runtime.trap("Timeline not found") };
      case (?timeline) {
        let updatedTimeline = timeline.map<InvestigationEntry, InvestigationEntry>(
          func(entry) {
            if (entry.id == entryId) {
              {
                id = entry.id;
                timestamp = entry.timestamp;
                title = entry.title;
                description = entry.description;
                mediaUrls = entry.mediaUrls;
                author = entry.author;
                tags = entry.tags;
                photos = entry.photos.concat([photo]);
              };
            } else {
              entry;
            };
          }
        );
        investigationTimelines.add(crashId, updatedTimeline);
      };
    };
  };

  public shared ({ caller }) func updateInvestigationEntry(
    crashId : Nat,
    entryId : Nat,
    timestamp : Int,
    newTitle : Text,
    newDescription : Text,
  ) : async () {
    switch (investigationTimelines.get(crashId)) {
      case (null) { Runtime.trap("Timeline not found") };
      case (?timeline) {
        let updatedTimeline = timeline.map<InvestigationEntry, InvestigationEntry>(
          func(entry) {
            if (entry.id == entryId) {
              {
                id = entry.id;
                timestamp;
                title = newTitle;
                description = newDescription;
                mediaUrls = entry.mediaUrls;
                author = entry.author;
                tags = entry.tags;
                photos = entry.photos;
              };
            } else {
              entry;
            };
          }
        );
        investigationTimelines.add(crashId, updatedTimeline);
      };
    };
  };

  public query ({ caller }) func getInvestigationEntry(crashId : Nat, entryId : Nat) : async ?InvestigationEntry {
    switch (investigationTimelines.get(crashId)) {
      case (null) { null };
      case (?timeline) {
        timeline.toArray().find(
          func(entry) { entry.id == entryId }
        );
      };
    };
  };

  public query ({ caller }) func getAllInvestigationEntries(crashId : Nat) : async [InvestigationEntry] {
    switch (investigationTimelines.get(crashId)) {
      case (null) { [] };
      case (?timeline) {
        timeline.toArray();
      };
    };
  };
};
