import React, { Fragment, useEffect, useState } from "react";
import "./ProductReviews.css";
import { DataGrid } from "@material-ui/data-grid";
import { Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Sidebar from "./Sidebar";
import Star from "@mui/icons-material/Star";
import { useDispatch, useSelector } from "react-redux";
import { useAlert } from "react-alert";
import MetaData from "../layout/MetaData";
import { DELETE_REVIEW_RESET } from "../../constants/productConstant";
import { useNavigate } from "react-router-dom";
import { getAllReviews, clearError, deleteReview } from "../../actions/productAction";

const ProductReviews = () => {
  const dispatch = useDispatch();
  const alert = useAlert();
  const navigate = useNavigate();

  const [productId, setProductId] = useState("");

  const { error: deleteError, isDeleted } = useSelector((state) => state.review);
  const { error, reviews, loading } = useSelector((state) => state.productReviews);

  const deleteReviewHandler = (reviewId) => {
    dispatch(deleteReview(reviewId, productId));
  };

  const productReviewsSubmitHandler = (e) => {
    e.preventDefault();

    dispatch(getAllReviews(productId));
  }

  useEffect(() => {
    if(productId.length === 24) {
        dispatch(getAllReviews(productId));
    }
    if (error) {
      alert.error(error);
      dispatch(clearError());
    }

    if (deleteError) {
      alert.error(deleteError);
      dispatch(clearError());
    }

    if(isDeleted) {
      alert.success("Review Deleted Successfully");
      navigate("/admin/reviews");
      dispatch({ type: DELETE_REVIEW_RESET });
    }

  }, [dispatch, error, alert, deleteError, navigate, isDeleted, productId]);

  const columns = [
    {
      field: "id",
      headerName: "Review ID",
      minWidth: 200,
      flex: 0.5,
    },
    {
      field: "user",
      headerName: "User",
      minWidth: 150,
      flex: 0.5,
    },
    {
      field: "comment",
      headerName: "Comment",
      minWidth: 200,
      flex: 1,
    },
    {
      field: "rating",
      headerName: "Rating",
      type: "number",
      minWidth: 100,
      flex: 0.3,
      cellClassName: (params) => {
        return params.getValue(params.id, "rating") >= 3
          ? "greenColor"
          : "redColor";
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "number",
      minWidth: 150,
      flex: 0.5,
      sortable: false,
      renderCell: (params) => {
        return (
          <Fragment>
            <Button onClick={() => deleteReviewHandler(params.getValue(params.id, "id"))}>
              <DeleteIcon />
            </Button>
          </Fragment>
        );
      },
    },
  ];

  const rows = [];

  reviews &&
    reviews.forEach((item) => {
      rows.push({
        id: item._id,
        rating: item.rating,
        comment: item.comment,
        user: item.name,
      });
    });

  return (
    <Fragment>
      <MetaData title={`All Reviews - Admin`} />
      <div className="dashboard">
        <Sidebar />
        <div className="productReviewsContainer">
        <form
              className="productReviewsForm"
              onSubmit={productReviewsSubmitHandler}
            >
              <h1 className="productReviewsFormHeading">ALL REVIEWS</h1>
              <div>
                <Star />
                <input
                  type="text"
                  placeholder="Product Id"
                  required
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                />
              </div>

              <Button
                id="createProductBtn"
                type="submit"
                disabled={
                    loading ? true : false || productId === "" ? true : false
                }
              >
                Search
              </Button>
            </form>
         {reviews && reviews.length > 0 ?
             <DataGrid
             rows={rows}
             columns={columns}
             pageSize={10}
             disableSelectionOnClick
             className="productListTable"
             autoHeight
           />
          :
         <h1 className="productReviewsFormHeading">No Review Found</h1> 
        }
        </div>
      </div>
    </Fragment>
  );
};

export default ProductReviews;
