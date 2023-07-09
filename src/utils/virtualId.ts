/** Virtual ID (_id to id) for react-admin */
export default function virtualId<T extends { _id?: ID }, ID>(
  el: Array<T> | T
) {
  if (Array.isArray(el)) {
    return el.map((e) => {
      return {
        id: e._id,
        ...e,
        _id: undefined
      };
    });
  }

  return { id: el._id, ...el, _id: undefined };
}
