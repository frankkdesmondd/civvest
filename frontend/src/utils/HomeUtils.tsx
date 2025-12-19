import CompanyLogo from '../assets/civvest company logo.png'
import BackgroundVideo from '../assets/oil.mp4'
import SignUpLogo from '../assets/signup logo.png'
import CompanyView  from '../assets/company logo.jpg'
import FounderPartner from '../assets/founding partner.jpeg'
import ManagingPartner from '../assets/managing partner.jpeg'
import ChiefOperatingOfficer from '../assets/chief operating officer.jpeg'
import SeniorVicePresiDiver from '../assets/senior vice president.jpeg'
import SeniorVicePresiCom from '../assets/senior vice president communications.jpeg'
import Geologist from '../assets/geologist.jpeg'
import ProjectManager from '../assets/project manager.jpeg'
import LegalCounsel from '../assets/legal council.jpeg'
import MiningPicture from '../assets/mining picture.jpg'
import EducationImage from '../assets/oil rig 2d.jpg'
import MastComm from '../assets/communication.jpg'
import Partnership from '../assets/partnership.jpg'
import ResearchImage from '../assets/research.jpg'
import OrganicGrowth from '../assets/organic growth.jpg'

type HomeUtilsType = {
  companyLogo: string;
  backgroundVideo: string;
  signUpLogo: string;
  companyView: string;
  foundingPartner: string;
  managingPartner: string;
  chiefOperatingOfficer: string;
  seniorVicePresiDiver: string;
  seniorVicePresiCom: string;
  geologist: string;
  projectManager: string;
  legalCouncil: string;
  miningPicture: string;
  educationImage: string;
  mastComm: string;
  partnership: string;
  researchImage: string;
  organicGrowth: string;
}

export const HomeUtils: HomeUtilsType[] = [
  {
    companyLogo: CompanyLogo,
    backgroundVideo: BackgroundVideo,
    signUpLogo: SignUpLogo,
    companyView: CompanyView,
    foundingPartner: FounderPartner,
    managingPartner: ManagingPartner,
    chiefOperatingOfficer: ChiefOperatingOfficer,
    seniorVicePresiDiver: SeniorVicePresiDiver,
    seniorVicePresiCom: SeniorVicePresiCom,
    geologist: Geologist,
    projectManager: ProjectManager,
    legalCouncil: LegalCounsel,
    miningPicture: MiningPicture,
    educationImage: EducationImage,
    mastComm: MastComm,
    partnership: Partnership,
    researchImage: ResearchImage,
    organicGrowth: OrganicGrowth,
  }
]