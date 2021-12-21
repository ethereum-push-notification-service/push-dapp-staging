import React from "react";
import styled from "styled-components";
import Loader from "react-loader-spinner";
import { Waypoint } from "react-waypoint";
import { useDispatch, useSelector, useStore } from "react-redux";
import { postReq } from "api";
import { useWeb3React } from "@web3-react/core";
import {BsSearch} from 'react-icons/bs'
import DisplayNotice from "components/DisplayNotice";
import ViewChannelItem from "components/ViewChannelItem";
import Faucets from "components/Faucets";

import ChannelsDataStore from "singletons/ChannelsDataStore";

import { setChannelMeta, incrementPage } from "redux/slices/channelSlice";
import { cacheChannelInfo } from "redux/slices/channelSlice";

const CHANNELS_PER_PAGE = 10; //pagination parameter which indicates how many channels to return over one iteration
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// Create Header
function ViewChannels() {
  const dispatch = useDispatch();
  const { account, chainId } = useWeb3React();
  const { channels, page } = useSelector((state: any) => state.channels);
  const [loading, setLoading] = React.useState(false);
  const [moreLoading, setMoreLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [channelToShow,setChannelToShow]=React.useState([]);
  // const [page, setPage] = React.useState(0);

  const channelsVisited = page * CHANNELS_PER_PAGE;

  // fetch channel data if we are just getting to this pae
  React.useEffect(() => {
    setLoading(!channels.length); //if there are no channels initially then, set the loader
    fetchInitialsChannelMeta();
  }, [account, chainId]);

  // to update a page
  const updateCurrentPage = () => {
    if (loading || moreLoading) return;
    // fetch more channel information
    setMoreLoading(true);
    dispatch(incrementPage());
    loadMoreChannelMeta(page + 1); //load the meta for the next page
  };

  // to fetch initial channels and logged in user data
  const fetchInitialsChannelMeta = async () => {
    // fetch the meta of the first `CHANNELS_PER_PAGE` channels
    const channelsMeta = await ChannelsDataStore.instance.getChannelsMetaAsync(
      channelsVisited,
      CHANNELS_PER_PAGE
    );
    if (!channels.length) {
      dispatch(setChannelMeta(channelsMeta));
    }
    setLoading(false);
  };

  // load more channels when we get to the bottom of the page
  const loadMoreChannelMeta = async (newPageNumber: any) => {
    const startingPoint = newPageNumber * CHANNELS_PER_PAGE;
    const moreChannels = await ChannelsDataStore.instance.getChannelsMetaAsync(
      startingPoint,
      CHANNELS_PER_PAGE
    );
    dispatch(setChannelMeta([...channels, ...moreChannels]));
    setMoreLoading(false);
  };

  // conditionally display the waymore bar which loads more information
  // load more channels when we are at the bottom of the page
  const showWayPoint = (index: any) => {
    return Number(index) === channels.length - 1;
  };

  // Search Channels Feature
  React.useEffect(()=>{
    setChannelToShow(channels);
  },[])
  React.useEffect(()=>{
      if(search){
      postReq("/channels/search",{
        "query":search,
        "op":"read"
      }).then(data=>{
        setChannelToShow(data.data.channels);
      })}
      else {
        setChannelToShow(channels);
      }
  },[search]);

  
  return (
    <>
      <Container>
        {!loading && channels.length == 0 ? (
          <ContainerInfo>
            <DisplayNotice
              title="That's weird, No Channels in EPNS... world is ending... right?"
              theme="primary"
            />
          </ContainerInfo>
        ) : (
          <Items id="scrollstyle-secondary">
          {!loading && <Faucets />}
          <div style={{position:"relative",width:"300px"}}>
            <SearchBar
            type="search"
            value={search}
            onChange={e=>setSearch(e.target.value)}
            className="input"
            placeholder="Search By Name/Address"
          />
          <BsSearch style={{position:"absolute",background:"#e20880",padding:"10px",borderRadius:"25px",color:"white", right:"2px",top:"2px"}}/>
          </div>
            {
          !search?channels.filter(Boolean).map((channel, index) => (
              <>
                {channel.addr !== ZERO_ADDRESS && (
                  <div key={channel.addr}>
                    <ViewChannelItem
                      channelObjectProp={channel}
                    />
                  </div>
                )}
                {showWayPoint(index) && (
                  <Waypoint onEnter={updateCurrentPage} />
                )}
              </>
            )):channelToShow?channelToShow.map((channel, index) => (
              <>
                {channel.addr !== ZERO_ADDRESS && (
                  <div key={channel.addr}>
                    <ViewChannelItem
                      channelObjectProp={channel}
                    />
                  </div>
                )}
                {showWayPoint(index) && (
                  <Waypoint onEnter={updateCurrentPage} />
                )}
              </>
            )):
            <div style={{padding:"2rem"}}>
              No Channel Found
            </div>
              
            }

            {/* display loader if pagination is loading next batch of channelTotalList */}
            {((moreLoading && channels.length) || loading) && (
              <CenterContainer>
                <Loader type="Oval" color="#35c5f3" height={40} width={40} />
              </CenterContainer>
            )}
          </Items>
        )}
      </Container>
    </>
  );
}

// css styles
const SearchBar=styled.input`
    border: 1px solid grey;
    border-radius: 20px;    
    width:300px;
    padding: 10px 10px 10px 10px;
    outline: 0;
    background-color: #f5f5f5;
    input[type="reset"]
   {
     display:none;
   }
`;
const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;

  font-weight: 200;
  align-content: center;
  align-items: center;
  justify-content: center;

  max-height: 80vh;
`;

const ContainerInfo = styled.div`
  padding: 20px;
`;

const CenterContainer = styled(ContainerInfo)`
  width: fit-content;
  margin: auto;
`;

const Items = styled.div`
  display: block;
  align-self: stretch;
  padding: 10px 20px;
  overflow-y: scroll;
  background: #fafafa;
`;

// Export Default
export default ViewChannels;