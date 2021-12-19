import React from "react";
import hex2ascii from "hex2ascii";
import styled from "styled-components";
import Loader from "react-loader-spinner";
import { Waypoint } from "react-waypoint";
import { useWeb3React } from "@web3-react/core";
import { useSelector } from "react-redux";
import {
  api,
  utils,
  NotificationItem,
} from "@epnsproject/frontend-sdk-staging";


const PAGE_COUNT = 6;
// Create Header
function Feedbox() {
  const { account } = useWeb3React();
  const { epnsCommReadProvider } = useSelector((state: any) => state.contracts);

  const [notifications, setNotifications] = React.useState([]);
  // since we dont have how many notifications there are in total
  // we use this field to note when there are no more notifications to load
  const [finishedFetching, setFinishedFetching] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);

  const loadNotifications = async (currentPage: any) => {
    setLoading(true);
    try {
      const { count, results } = await api.fetchNotifications(
        account,
        PAGE_COUNT,
        currentPage
      );
      const parsedResponse = utils.parseApiResponse(results);
      setNotifications((oldNotifications) => [
        ...oldNotifications,
        ...parsedResponse,
      ]);
      if (count === 0) {
        setFinishedFetching(true);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };


  React.useEffect(() => {
    if (epnsCommReadProvider) {
      loadNotifications(currentPage);
    }
  }, [epnsCommReadProvider, account]);

  //function to query more notifications
  const handlePagination = async () => {
    setCurrentPage((prevPage) => {
      const newPage = prevPage + 1;
      loadNotifications(newPage);
      return newPage;
    });
  };


  const showWayPoint = (index: any) => {
    return Number(index) === notifications.length - 1 && !finishedFetching;
  };

  // Render
  return (
    <>
      <Container>
        {notifications && (
          <Items id="scrollstyle-secondary">
            {notifications.map((oneNotification, index) => {
              const { cta, title, message, app, icon, image } = oneNotification;

              // render the notification item
              return (
                <>
                  {showWayPoint(index) && (
                    <Waypoint onEnter={() => handlePagination()} />
                  )}
                  <NotificationItem
                    notificationTitle={title}
                    notificationBody={message}
                    cta={cta}
                    app={app}
                    icon={icon}
                    image={image}
                  />
                </>
              );
            })}
          </Items>
        )}
        {loading && (
          <Loader type="Oval" color="#35c5f3" height={40} width={40} />
        )}
      </Container>
    </>
  );
}

const Items = styled.div`
  display: block;
  align-self: stretch;
  padding: 10px 20px;
  overflow-y: scroll;
  background: #fafafa;
`;
// css styles
const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;

  font-weight: 200;
  align-content: center;
  align-items: center;
  justify-content: center;
  max-height: 100vh;

  // padding: 20px;
  // font-size: 16px;
  // display: flex;
  // font-weight: 200;
  // align-content: center;
  // align-items: center;
  // justify-content: center;
  // width: 100%;
  // min-height: 40vh;
`;


// Export Default
export default Feedbox;
